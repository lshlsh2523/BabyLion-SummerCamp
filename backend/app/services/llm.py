import asyncio
import json
import logging
import os
import re
from typing import Union

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..db import Answer, GenerationJob, SessionLocal, Store
from .keyword_theme import classify_theme

# 한자(CJK 표의문자)·일본어 가나 등 한국어가 아닌 문자. LLM 이 섞어 넣으면 제거한다.
_NON_KOREAN = re.compile(r"[぀-ヿ㐀-䶿一-鿿豈-﫿]")


def _ko_only(text):
    """문자열에서 한자·가나 등 비한국어 문자를 제거하고 공백을 정리한다."""
    if not isinstance(text, str):
        return text
    return re.sub(r"\s{2,}", " ", _NON_KOREAN.sub("", text)).strip()


def _cap_story_lines(lines, limit=160):
    """스토리 세 문장의 합계 길이를 limit(자) 이내로 강제. 초과분은 잘라 '…' 표시."""
    out, used = [], 0
    for raw in lines:
        line = (raw or "").strip()
        if not line:
            continue
        if used + len(line) <= limit:
            out.append(line)
            used += len(line)
        else:
            remain = limit - used
            if remain >= 8:                      # 의미 있는 조각만 남긴다
                out.append(line[:remain].rstrip() + "…")
            break
    return out or [(lines[0].strip() if lines else "")]


logger = logging.getLogger("uvicorn.error")


class StoryPayload(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    story_lines: list[str]
    hashtags: list[str]
    theme_id: Union[int, str]
    quoted_sentence: str = Field(min_length=1, max_length=300)
    main_menu: str = Field(default="", max_length=30)   # 인터뷰에서 정제한 짧은 대표 메뉴명


def _get_client():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError("The openai package is not installed") from exc
    # OPENAI_BASE_URL 이 있으면 OpenAI 호환 엔드포인트(예: Gemini)로 호출한다.
    base_url = os.environ.get("OPENAI_BASE_URL")
    return OpenAI(api_key=api_key, base_url=base_url) if base_url else OpenAI(api_key=api_key)


def _story_dict(story: StoryPayload) -> dict:
    if len(story.story_lines) != 3 or any(not line.strip() for line in story.story_lines):
        raise ValueError("story_lines must contain exactly three non-empty strings")
    if not 1 <= len(story.hashtags) <= 10 or any(not tag.strip() for tag in story.hashtags):
        raise ValueError("hashtags must contain between one and ten non-empty strings")
    return story.model_dump() if hasattr(story, "model_dump") else story.dict()


async def run_llm_generation_workflow(job_id: str, store_id: str) -> None:
    """Generate, validate, and persist a story while recording job outcome."""
    db: Session = SessionLocal()
    try:
        job = db.get(GenerationJob, job_id)
        store = db.get(Store, store_id)
        if job is None or store is None:
            raise RuntimeError("Generation job or store was not found")

        job.status = "processing"
        db.commit()

        answers = (
            db.query(Answer)
            .filter(Answer.store_id == store_id)
            .order_by(Answer.question_no)
            .all()
        )
        answer_text = "\n".join(f"Q{answer.question_no}: {answer.transcript}" for answer in answers)
        system_prompt = (
            "당신은 대한민국 지역 노포(오래된 가게) 사장님의 음성 인터뷰(STT 변환본)를 다듬어 "
            "브랜드 스토리를 쓰는 한국어 카피라이터입니다. "
            "입력은 음성 인식 결과라 사투리·구어체·오인식으로 깨진 단어가 섞여 있습니다. "
            "문맥으로 자연스럽게 보정하세요. 특히 STT 오인식으로 어색한 단어는 상식적인 표현으로 고칩니다 "
            "(예: '에트로' -> '레트로', '가마솟' -> '가마솥', '대물림' 문맥이면 그대로). "
            "확신이 없으면 억지로 넣지 말고 자연스럽게 빼세요. "
            "모든 출력 텍스트(title, story_lines, hashtags, quoted_sentence)는 반드시 '순수한 한글'로만 작성합니다. "
            "다음을 절대 사용하지 마세요: 한자(漢字), 영어 알파벳, 일본어 가나, 중국어, 그 밖의 외국 문자. "
            "예를 들어 '전承하다'처럼 한자를 섞지 말고 '전하다'처럼 순 한글로만 쓰세요. "
            "숫자와 % 같은 기호, 해시태그의 # 기호는 허용됩니다. "
            "JSON 객체 하나만 출력합니다. "
            "키: title(문자열), story_lines(정확히 3개의 한국어 문장 배열), hashtags(#로 시작하는 한글 태그 배열), "
            "theme_id(문자열), quoted_sentence(가게의 한마디), main_menu(대표 메뉴명). "
            "quoted_sentence 규칙: 위 story_lines 세 문장의 핵심을 가장 잘 대표하는 인상적인 한 문장으로 "
            "새로 지어냅니다(40자 이내). 사장님이 손님에게 건네는 말투가 좋습니다. "
            "story_lines 규칙: 정확히 세 문장. 각 문장은 50자 내외로(너무 짧지 않게, 가게의 사연·개성이 "
            "담기도록) 쓰고, 세 문장 합쳐 150자 이내로 맞춥니다. 밋밋한 나열이 아니라 첫 문장부터 "
            "손님의 눈길을 끄는 임팩트 있는 문장으로, 군더더기·중복·상투적 표현은 빼세요. "
            "main_menu 규칙: 문장이 아니라 메뉴 '이름'만 짧게(명사구, 12자 이내). "
            "STT 오인식은 표준 표기로 교정하세요(예: '딸지주스' -> '딸기주스', '수국차' 그대로). "
            "story_lines·title 등 다른 곳의 메뉴 표기도 이 교정된 이름과 동일하게 통일합니다. "
            "예: '저희는 수국 차가 유명합니다' -> '수국차', '가마솥에 끓인 국밥이 대표예요' -> '가마솥국밥'."
        )
        user_prompt = (
            f"창업연도: {store.founded_year}\n"
            f"대표메뉴: {store.main_menu}\n가격: {store.price}\n"
            f"사장님 인터뷰:\n{answer_text}\n\n"
            "위 내용을 바탕으로 한국어 가게 스토리(세 문장, 각 50자 내외)를 만들어 주세요."
        )
        client = _get_client()
        response = await asyncio.wait_for(
            asyncio.to_thread(
                client.chat.completions.create,
                model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            ),
            timeout=30,
        )
        raw = response.choices[0].message.content
        if not raw:
            raise ValueError("The model returned an empty response")
        story_dict = _story_dict(StoryPayload(**json.loads(raw)))
        # 순 한글 강제: 모델이 섞어 넣은 한자·가나 등 비한국어 문자를 제거한다.
        story_dict["title"] = _ko_only(story_dict.get("title", ""))
        story_dict["quoted_sentence"] = _ko_only(story_dict.get("quoted_sentence", ""))
        story_dict["story_lines"] = _cap_story_lines([_ko_only(line) for line in story_dict.get("story_lines", [])])
        story_dict["hashtags"] = [_ko_only(tag) for tag in story_dict.get("hashtags", [])]
        # LLM 이 자유롭게 뱉은 theme_id 는 무시하고, 단어 빈도로 프론트 3종 중 하나를 강제한다.
        theme_source = " ".join([
            story_dict.get("title", ""),
            *story_dict.get("story_lines", []),
            story_dict.get("quoted_sentence", ""),
            answer_text,
        ])
        story_dict["theme_id"] = classify_theme(theme_source)
        # 대표 메뉴명 정제: 음성이 문장으로 들어온 경우 LLM 이 뽑아준 짧은 이름으로 교체.
        clean_menu = _ko_only(story_dict.get("main_menu", ""))[:30].strip()
        if clean_menu:
            store.main_menu = clean_menu
        store.story = story_dict
        job.status = "done"
        job.error = None
        db.commit()
    except asyncio.TimeoutError:
        db.rollback()
        _mark_failed(db, job_id, "TIMEOUT_ERROR: generation exceeded 30 seconds")
    except Exception as exc:
        db.rollback()
        logger.exception("Generation job %s failed", job_id)
        _mark_failed(db, job_id, f"GENERATION_ERROR: {exc}")
    finally:
        db.close()


def _mark_failed(db: Session, job_id: str, error: str) -> None:
    job = db.get(GenerationJob, job_id)
    if job is not None:
        job.status = "failed"
        job.error = error[:1000]
        db.commit()
