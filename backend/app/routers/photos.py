"""이슈 #2 — 사진 업로드 및 리사이징 엔진 (명세서 2장).

POST   /stores/{store_id}/photos              multipart 업로드, 5장 제한, 1600px 리사이즈
DELETE /stores/{store_id}/photos/{photo_id}   다시 찍기용 삭제
"""
import io
import os

from fastapi import APIRouter, Depends, File, Response, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from ..core import (MEDIA_DIR, PHOTO_FORMATS, PHOTO_MAX_BYTES,
                    PHOTO_MAX_COUNT, PHOTO_RESIZE_LONG_EDGE, ApiError,
                    edit_token_header, file_ext, require_token)
from ..db import Photo, get_db, new_uuid
from .stores import get_store_or_404

router = APIRouter()


@router.post("/stores/{store_id}/photos", status_code=201)
def upload_photo(
    store_id: str,
    file: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
    x_edit_token: str | None = Depends(edit_token_header),
):
    store = get_store_or_404(store_id, db)                      # 404
    require_token(store, x_edit_token)                          # 403

    count = db.query(Photo).filter(Photo.store_id == store_id).count()
    if count >= PHOTO_MAX_COUNT:                                # 409
        raise ApiError(409, "LIMIT_EXCEEDED", f"사진은 가게당 최대 {PHOTO_MAX_COUNT}장입니다.")

    if file is None:
        raise ApiError(400, "VALIDATION_ERROR", "file 필드가 필요합니다.")

    ext = file_ext(file.filename)
    if ext not in PHOTO_FORMATS:                                # 415
        raise ApiError(415, "UNSUPPORTED_FORMAT", "jpg / png / webp만 업로드할 수 있습니다.")

    data = file.file.read()
    if len(data) > PHOTO_MAX_BYTES:                             # 413
        raise ApiError(413, "FILE_TOO_LARGE", "사진은 장당 최대 10MB입니다.")

    try:
        image = Image.open(io.BytesIO(data))
        image.load()
    except Exception:
        raise ApiError(415, "UNSUPPORTED_FORMAT", "이미지 파일을 읽을 수 없습니다.")

    # 긴 변 1600px 초과 시 비율 유지 축소 (명세서 2.1)
    if max(image.size) > PHOTO_RESIZE_LONG_EDGE:
        image.thumbnail((PHOTO_RESIZE_LONG_EDGE, PHOTO_RESIZE_LONG_EDGE), Image.LANCZOS)

    photo = Photo(photo_id=new_uuid(), store_id=store_id,
                  sort_order=_next_sort_order(db, store_id), path="", url="")
    save_ext = "jpg" if ext == "jpeg" else ext
    directory = os.path.join(MEDIA_DIR, "stores", store_id)
    os.makedirs(directory, exist_ok=True)
    filename = f"p{photo.sort_order}_{photo.photo_id[:8]}.{save_ext}"
    photo.path = os.path.join(directory, filename)
    photo.url = f"/media/stores/{store_id}/{filename}"

    if save_ext == "jpg" and image.mode in ("RGBA", "P", "LA"):
        image = image.convert("RGB")
    image.save(photo.path)

    db.add(photo)
    db.commit()
    return {"photo_id": photo.photo_id, "url": photo.url, "sort_order": photo.sort_order}


@router.delete("/stores/{store_id}/photos/{photo_id}", status_code=204)
def delete_photo(
    store_id: str,
    photo_id: str,
    db: Session = Depends(get_db),
    x_edit_token: str | None = Depends(edit_token_header),
):
    store = get_store_or_404(store_id, db)
    require_token(store, x_edit_token)

    photo = (
        db.query(Photo)
        .filter(Photo.store_id == store_id, Photo.photo_id == photo_id)
        .first()
    )
    if photo is None:
        raise ApiError(404, "PHOTO_NOT_FOUND", "존재하지 않는 사진입니다.")

    if os.path.exists(photo.path):
        os.remove(photo.path)
    db.delete(photo)
    db.commit()
    return Response(status_code=204)                            # 본문 없음


def _next_sort_order(db: Session, store_id: str) -> int:
    last = (
        db.query(Photo).filter(Photo.store_id == store_id)
        .order_by(Photo.sort_order.desc()).first()
    )
    return (last.sort_order + 1) if last else 1
