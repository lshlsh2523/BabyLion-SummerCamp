import asyncio
import json
import logging
import os
from typing import Union

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..db import Answer, GenerationJob, SessionLocal, Store


logger = logging.getLogger("uvicorn.error")


class StoryPayload(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    story_lines: list[str]
    hashtags: list[str]
    theme_id: Union[int, str]
    quoted_sentence: str = Field(min_length=1, max_length=300)


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
            "당신은 대한민국 지역 노포(오래된 가게)의 따뜻한 브랜드 스토리를 쓰는 한국어 카피라이터입니다. "
            "모든 출력 텍스트(title, story_lines, hashtags, quoted_sentence)는 반드시 한국어로 작성하세요. "
            "영어를 절대 쓰지 마세요. JSON 객체 하나만 출력합니다. "
            "키: title(문자열), story_lines(정확히 3개의 한국어 문장 배열), hashtags(#로 시작하는 한국어 태그 배열), "
            "theme_id(문자열), quoted_sentence(상인의 인상적인 한마디, 한국어)."
        )
        user_prompt = (
            f"창업연도: {store.founded_year}\n"
            f"대표메뉴: {store.main_menu}\n가격: {store.price}\n"
            f"사장님 인터뷰:\n{answer_text}\n\n"
            "위 내용을 바탕으로 한국어 가게 스토리를 만들어 주세요."
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
        store.story = _story_dict(StoryPayload(**json.loads(raw)))
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
