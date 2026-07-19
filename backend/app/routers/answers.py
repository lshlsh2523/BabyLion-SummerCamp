"""이슈 #3 — 음성 답변 업로드 및 동기 STT 연동 (명세서 4장).

POST /stores/{store_id}/answers   질문별 음성 업로드 -> 즉시 STT -> transcript 반환
같은 question_no 재업로드 시 기존 답변을 덮어쓴다 (별도 삭제 API 없음).
STT 자체는 services/stt.transcribe() 뒤에 숨어 있어 월요일 교체가 이 파일에 영향 없음.
"""
import os

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from ..core import (AUDIO_FORMATS, AUDIO_MAX_BYTES, AUDIO_MAX_SECONDS,
                    PRIVATE_DIR, QUESTION_NOS, ApiError, audio_duration_seconds,
                    edit_token_header, file_ext, require_token,
                    validation_error)
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
    store = get_store_or_404(store_id, db)                      # 404
    require_token(store, x_edit_token)                          # 403

    # ---- 값 검증 (400)
    try:
        qno = int(question_no)
    except (TypeError, ValueError):
        raise validation_error("question_no는 1~3 사이 정수여야 합니다.")
    if qno not in QUESTION_NOS:
        raise validation_error("question_no는 1~3 사이 정수여야 합니다.")
    if file is None:
        raise validation_error("file 필드가 필요합니다.")

    # ---- 파일 검증 (415 / 413 / 422)
    ext = file_ext(file.filename)
    if ext not in AUDIO_FORMATS:
        raise ApiError(415, "UNSUPPORTED_FORMAT", "webm / mp3 / wav / m4a만 업로드할 수 있습니다.")

    data = file.file.read()
    if len(data) > AUDIO_MAX_BYTES:
        raise ApiError(413, "FILE_TOO_LARGE", "음성 파일은 최대 15MB입니다.")

    # 비공개 저장소(PRIVATE_DIR) — /media 정적 서빙 대상이 아니라 URL 추측으로 접근 불가
    directory = os.path.join(PRIVATE_DIR, "answers", store_id)
    os.makedirs(directory, exist_ok=True)
    path = os.path.join(directory, f"q{qno}.{ext}")
    with open(path, "wb") as f:
        f.write(data)

    duration = audio_duration_seconds(path)     # ffprobe 없으면 None -> 스킵
    if duration is not None and duration > AUDIO_MAX_SECONDS:
        os.remove(path)
        raise ApiError(422, "AUDIO_TOO_LONG", f"음성은 최대 {AUDIO_MAX_SECONDS}초입니다.")

    # ---- 동기 STT (월요일: 백2 Whisper 함수로 내부 교체)
    hint = build_hint(store.main_menu)
    transcript = transcribe(path, hint)

    # ---- 같은 question_no 재업로드 = 덮어쓰기 (Upsert)
    answer = (
        db.query(Answer)
        .filter(Answer.store_id == store_id, Answer.question_no == qno)
        .first()
    )
    if answer is None:
        answer = Answer(store_id=store_id, question_no=qno, path=path, transcript=transcript)
        db.add(answer)
    else:
        if answer.path != path and os.path.exists(answer.path):
            os.remove(answer.path)              # 확장자가 바뀐 재업로드면 이전 파일 정리
        answer.path = path
        answer.transcript = transcript
    db.commit()

    return {"answer_id": answer.answer_id, "question_no": qno, "transcript": transcript}
