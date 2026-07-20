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
    return OpenAI(api_key=api_key)


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
            "Write a warm Korean story about a local store. Return JSON only with "
            "title, story_lines (exactly three strings), hashtags, theme_id, and quoted_sentence."
        )
        user_prompt = (
            f"Store founded year: {store.founded_year}\n"
            f"Main menu: {store.main_menu}\nPrice: {store.price}\n"
            f"Owner interview:\n{answer_text}"
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
