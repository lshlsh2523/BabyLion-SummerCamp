"""Photo upload, resize, and deletion endpoints."""
import io
import os
import warnings

from fastapi import APIRouter, Depends, File, Response, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from ..core import (
    MEDIA_DIR,
    PHOTO_FORMATS,
    PHOTO_MAX_BYTES,
    PHOTO_MAX_COUNT,
    PHOTO_MAX_PIXELS,
    PHOTO_RESIZE_LONG_EDGE,
    ApiError,
    edit_token_header,
    file_ext,
    require_token,
)
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
    store = get_store_or_404(store_id, db)
    require_token(store, x_edit_token)
    if db.query(Photo).filter(Photo.store_id == store_id).count() >= PHOTO_MAX_COUNT:
        raise ApiError(409, "LIMIT_EXCEEDED", f"A store can have at most {PHOTO_MAX_COUNT} photos.")
    if file is None:
        raise ApiError(400, "VALIDATION_ERROR", "file is required.")

    ext = file_ext(file.filename)
    if ext not in PHOTO_FORMATS:
        raise ApiError(415, "UNSUPPORTED_FORMAT", "Only jpg, png, and webp files are supported.")
    data = file.file.read()
    if len(data) > PHOTO_MAX_BYTES:
        raise ApiError(413, "FILE_TOO_LARGE", "Photo files must not exceed 10MB.")

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            image = Image.open(io.BytesIO(data))
            if image.width * image.height > PHOTO_MAX_PIXELS:
                raise ApiError(413, "IMAGE_TOO_LARGE", "Image pixel count exceeds the allowed limit.")
            image.load()
    except ApiError:
        raise
    except (Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise ApiError(413, "IMAGE_TOO_LARGE", "Image pixel count exceeds the allowed limit.")
    except Exception:
        raise ApiError(415, "UNSUPPORTED_FORMAT", "The uploaded file is not a valid image.")

    if max(image.size) > PHOTO_RESIZE_LONG_EDGE:
        image.thumbnail((PHOTO_RESIZE_LONG_EDGE, PHOTO_RESIZE_LONG_EDGE), Image.LANCZOS)

    photo = Photo(
        photo_id=new_uuid(),
        store_id=store_id,
        sort_order=_next_sort_order(db, store_id),
        path="",
        url="",
    )
    save_ext = "jpg" if ext == "jpeg" else ext
    directory = os.path.join(MEDIA_DIR, "stores", store_id)
    os.makedirs(directory, exist_ok=True)
    filename = f"p{photo.sort_order}_{photo.photo_id[:8]}.{save_ext}"
    photo.path = os.path.join(directory, filename)
    photo.url = f"/media/stores/{store_id}/{filename}"
    if save_ext == "jpg" and image.mode in ("RGBA", "P", "LA"):
        image = image.convert("RGB")
    image.save(photo.path)

    try:
        db.add(photo)
        db.commit()
    except Exception:
        db.rollback()
        if os.path.exists(photo.path):
            os.remove(photo.path)
        raise
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
    photo = db.query(Photo).filter(Photo.store_id == store_id, Photo.photo_id == photo_id).first()
    if photo is None:
        raise ApiError(404, "PHOTO_NOT_FOUND", "Photo was not found.")

    db.delete(photo)
    db.commit()
    if os.path.exists(photo.path):
        os.remove(photo.path)
    return Response(status_code=204)


def _next_sort_order(db: Session, store_id: str) -> int:
    last = (
        db.query(Photo)
        .filter(Photo.store_id == store_id)
        .order_by(Photo.sort_order.desc())
        .first()
    )
    return last.sort_order + 1 if last else 1
