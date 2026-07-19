"""이슈 #1 — stores 기본 API (명세서 1장, 3장).

POST /stores                       가게 생성 + edit_token 발급 (토큰은 이 응답에서만 노출)
GET  /stores/{store_id}            편집용 전체 상태 조회 (새로고침 복구)
PUT  /stores/{store_id}/basic-info 보낸 필드만 부분 갱신
"""
from fastapi import APIRouter, Body, Depends
from sqlalchemy.orm import Session

from ..core import (edit_token_header, require_token, store_not_found,
                    validate_basic_info)
from ..db import Answer, Photo, Store, get_db

router = APIRouter()


def get_store_or_404(store_id: str, db: Session) -> Store:
    store = db.get(Store, store_id)
    if store is None:
        raise store_not_found()
    return store


@router.post("/stores", status_code=201)
def create_store(db: Session = Depends(get_db)):
    """명세서 1.1 — Request Body 없음. store_id / edit_token 반환."""
    store = Store()
    db.add(store)
    db.commit()
    return {"store_id": store.store_id, "edit_token": store.edit_token}


@router.get("/stores/{store_id}")
def get_store_state(
    store_id: str,
    db: Session = Depends(get_db),
    x_edit_token: str | None = Depends(edit_token_header),
):
    """명세서 1.2 — 진행 상태 복구용 전체 조회. edit_token은 절대 포함하지 않는다."""
    store = get_store_or_404(store_id, db)      # 404 먼저
    require_token(store, x_edit_token)          # 그다음 403

    photos = (
        db.query(Photo).filter(Photo.store_id == store_id)
        .order_by(Photo.sort_order).all()
    )
    answers = (
        db.query(Answer).filter(Answer.store_id == store_id)
        .order_by(Answer.question_no).all()
    )
    return {
        "store_id": store.store_id,
        "published": store.published,
        "basic_info": store.basic_info(),
        "photos": [
            {"photo_id": p.photo_id, "url": p.url, "sort_order": p.sort_order}
            for p in photos
        ],
        "answers": [
            {"answer_id": a.answer_id, "question_no": a.question_no, "transcript": a.transcript}
            for a in answers
        ],
        "story": store.story,
        "public_url": store.public_url,
    }


@router.put("/stores/{store_id}/basic-info")
def update_basic_info(
    store_id: str,
    payload=Body(default=None),
    db: Session = Depends(get_db),
    x_edit_token: str | None = Depends(edit_token_header),
):
    """명세서 3장 — 모든 필드 optional, 보낸 필드만 갱신. 404 -> 403 -> 400 순서 보장."""
    store = get_store_or_404(store_id, db)
    require_token(store, x_edit_token)
    fields = validate_basic_info(payload)       # 마지막에 400

    for key, value in fields.items():
        setattr(store, key, value)
    db.commit()
    db.refresh(store)

    # 명세서: 갱신된 basic_info 전체 반환
    return store.basic_info()
