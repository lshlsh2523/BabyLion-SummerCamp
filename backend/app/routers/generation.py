import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, status
from pydantic import BaseModel
from sqlalchemy import update
from sqlalchemy.orm import Session

from ..core import ApiError, edit_token_header, require_token, store_not_found, validation_error
from ..db import GenerationJob, Photo, Store, get_db
from ..services.llm import run_llm_generation_workflow

router = APIRouter()

MAX_REGENERATIONS = 5


class GenerateResponse(BaseModel):
    job_id: uuid.UUID


class JobStatusResponse(BaseModel):
    job_id: uuid.UUID
    status: str
    error: str | None


class PublishResponse(BaseModel):
    public_url: str


@router.post("/stores/{store_id}/generate", response_model=GenerateResponse, status_code=status.HTTP_202_ACCEPTED)
def generate_story(
    store_id: str,
    background_tasks: BackgroundTasks,
    retry: bool = False,
    x_edit_token: str | None = Depends(edit_token_header),
    db: Session = Depends(get_db),
):
    store = db.get(Store, store_id)
    if store is None:
        raise store_not_found()
    require_token(store, x_edit_token)

    missing = []
    if len(store.photos) < 3:
        missing.append("photos")
    if len(store.answers) < 3:
        missing.append("answers")
    if not store.main_menu:
        missing.append("main_menu")
    if store.price is None:
        missing.append("price")
    if missing:
        raise validation_error(f"Missing generation requirements: {', '.join(missing)}")

    active_job = (
        db.query(GenerationJob)
        .filter(
            GenerationJob.store_id == store_id,
            GenerationJob.status.in_(("pending", "processing")),
        )
        .first()
    )
    if active_job is not None:
        raise ApiError(409, "GENERATION_IN_PROGRESS", "A generation job is already in progress.")

    if retry:
        result = db.execute(
            update(Store)
            .where(Store.store_id == store_id, Store.generation_count < MAX_REGENERATIONS)
            .values(generation_count=Store.generation_count + 1)
        )
        if result.rowcount != 1:
            raise ApiError(409, "LIMIT_EXCEEDED", "Maximum regeneration count has been reached.")

    job_id = str(uuid.uuid4())
    db.add(GenerationJob(job_id=job_id, store_id=store_id, status="pending"))
    db.commit()
    background_tasks.add_task(run_llm_generation_workflow, job_id=job_id, store_id=store_id)
    return {"job_id": job_id}


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(
    job_id: str,
    x_edit_token: str | None = Depends(edit_token_header),
    db: Session = Depends(get_db),
):
    job = db.get(GenerationJob, job_id)
    if job is None:
        raise ApiError(404, "JOB_NOT_FOUND", "Generation job was not found.")
    store = db.get(Store, job.store_id)
    if store is None:
        raise store_not_found()
    require_token(store, x_edit_token)
    return {
        "job_id": job.job_id,
        "status": job.status,
        "error": "GENERATION_FAILED" if job.status == "failed" else None,
    }


@router.post("/stores/{store_id}/publish", response_model=PublishResponse)
def publish_story(
    store_id: str,
    x_edit_token: str | None = Depends(edit_token_header),
    db: Session = Depends(get_db),
):
    store = db.get(Store, store_id)
    if store is None:
        raise store_not_found()
    require_token(store, x_edit_token)
    if not store.story:
        raise validation_error("A generated story is required before publishing.")
    store.published = True
    store.public_url = f"/s/{store_id}"
    db.commit()
    return {"public_url": store.public_url}


@router.get("/public/stores")
def list_public_stores(db: Session = Depends(get_db)):
    """발행된 가게 목록 (노포 지도용). 인증 불필요."""
    stores = db.query(Store).filter(Store.published.is_(True)).all()
    return [
        {
            "store_id": store.store_id,
            "store_name": store.store_name,
            "address": store.address,
            "main_menu": store.main_menu,
            "theme_id": (store.story or {}).get("theme_id") if store.story else None,
        }
        for store in stores
    ]


@router.get("/public/stores/{store_id}")
def get_public_store_story(store_id: str, db: Session = Depends(get_db)):
    store = db.get(Store, store_id)
    if store is None or not store.published:
        raise store_not_found()
    photos = (
        db.query(Photo)
        .filter(Photo.store_id == store_id)
        .order_by(Photo.sort_order)
        .all()
    )
    return {
        "store_id": store.store_id,
        "basic_info": store.basic_info(),
        "story": store.story,
        "photos": [{"url": photo.url, "sort_order": photo.sort_order} for photo in photos],
    }
