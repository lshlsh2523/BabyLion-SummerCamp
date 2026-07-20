"""Audio-answer upload, validation, private storage, and STT integration."""
import os
import tempfile

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from ..core import (
    AUDIO_FORMATS,
    AUDIO_MAX_BYTES,
    AUDIO_MAX_SECONDS,
    PRIVATE_DIR,
    QUESTION_NOS,
    ApiError,
    audio_duration_seconds,
    edit_token_header,
    file_ext,
    require_token,
    validation_error,
)
from ..db import Answer, get_db
from ..services.stt import build_hint, transcribe
from .stores import get_store_or_404

router = APIRouter()


@router.post("/stores/{store_id}/answers", status_code=201)
def upload_answer(
    store_id: str,
    question_no: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
    x_edit_token: str | None = Depends(edit_token_header),
):
    store = get_store_or_404(store_id, db)
    require_token(store, x_edit_token)

    try:
        qno = int(question_no)
    except (TypeError, ValueError):
        raise validation_error("question_no must be an integer from 1 through 3.")
    if qno not in QUESTION_NOS:
        raise validation_error("question_no must be an integer from 1 through 3.")
    if file is None:
        raise validation_error("file is required.")

    ext = file_ext(file.filename)
    if ext not in AUDIO_FORMATS:
        raise ApiError(415, "UNSUPPORTED_FORMAT", "Only webm, mp3, wav, and m4a files are supported.")
    data = file.file.read()
    if len(data) > AUDIO_MAX_BYTES:
        raise ApiError(413, "FILE_TOO_LARGE", "Audio files must not exceed 15MB.")

    directory = os.path.join(PRIVATE_DIR, "answers", store_id)
    os.makedirs(directory, exist_ok=True)
    path = os.path.join(directory, f"q{qno}.{ext}")
    with tempfile.NamedTemporaryFile("wb", dir=directory, suffix=f".{ext}", delete=False) as temp_file:
        temp_path = temp_file.name
        temp_file.write(data)

    try:
        duration = audio_duration_seconds(temp_path)
        if duration is None:
            raise ApiError(
                503,
                "AUDIO_DURATION_UNAVAILABLE",
                "Install ffprobe to validate this audio format.",
            )
        if duration is not None and duration > AUDIO_MAX_SECONDS:
            raise ApiError(422, "AUDIO_TOO_LONG", f"Audio must not exceed {AUDIO_MAX_SECONDS} seconds.")
        transcript = transcribe(temp_path, build_hint(store.main_menu))
    except Exception:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise

    answer = (
        db.query(Answer)
        .filter(Answer.store_id == store_id, Answer.question_no == qno)
        .first()
    )
    old_path = answer.path if answer is not None else None
    backup_path = None
    if os.path.exists(path):
        with tempfile.NamedTemporaryFile(dir=directory, delete=False) as backup_file:
            backup_path = backup_file.name
        os.remove(backup_path)
        os.replace(path, backup_path)
    os.replace(temp_path, path)
    if answer is None:
        answer = Answer(store_id=store_id, question_no=qno, path=path, transcript=transcript)
        db.add(answer)
    else:
        answer.path = path
        answer.transcript = transcript
    try:
        db.commit()
    except Exception:
        db.rollback()
        if os.path.exists(path):
            os.remove(path)
        if backup_path and os.path.exists(backup_path):
            os.replace(backup_path, path)
        raise

    if backup_path and os.path.exists(backup_path):
        os.remove(backup_path)
    if old_path and old_path != path and os.path.exists(old_path):
        os.remove(old_path)
    return {"answer_id": answer.answer_id, "question_no": qno, "transcript": transcript}
