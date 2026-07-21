"""공통 기반: 설정 / 에러 규약 / X-Edit-Token 검증 / basic_info 필드 검증.

이슈 #1~#3 전부가 이 모듈에 의존한다. 에러 응답 포맷은 명세서 공통 규약:
    { "error": { "code": "...", "message": "...", ...extra } }
검증 순서는 항상 404(가게 없음) -> 403(토큰) -> 400/4xx(값 검증).
"""
import os
import re
import shutil
import subprocess
import wave
from datetime import datetime
from pathlib import Path

from fastapi import Header
from fastapi.responses import JSONResponse

# .env 자동 로드 (backend/.env). 이미 설정된 환경변수는 덮어쓰지 않는다(테스트 안전).
try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
except ModuleNotFoundError:
    pass

# ---------------------------------------------------------------- 설정
BASE_DIR = Path(__file__).resolve().parents[1]
MEDIA_DIR = os.environ.get("MEDIA_DIR", str(BASE_DIR / "media"))
# 음성 답변 등 비공개 파일 저장소 — /media처럼 정적 서빙하지 않는다.
# 발행 후 store_id가 공개되므로, 서빙 경로에 두면 URL 추측만으로 다운로드가 가능해진다.
PRIVATE_DIR = os.environ.get("PRIVATE_DIR", str(BASE_DIR / "private"))
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{(BASE_DIR / 'babylion.db').as_posix()}")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]

PHOTO_MAX_COUNT = 5
PHOTO_MAX_BYTES = 10 * 1024 * 1024          # 10MB
PHOTO_MAX_PIXELS = 40_000_000
PHOTO_FORMATS = {"jpg", "jpeg", "png", "webp"}
PHOTO_RESIZE_LONG_EDGE = 1600

AUDIO_MAX_BYTES = 15 * 1024 * 1024          # 15MB
AUDIO_MAX_SECONDS = 60                       # CLOVA 단문 인식 상한(60초)에 맞춤
AUDIO_FORMATS = {"webm", "mp3", "wav", "m4a"}  # 업로드 허용 포맷(webm 은 STT 단계에서 wav 변환)
QUESTION_NOS = {1, 2, 3}

DAYS = ["월", "화", "수", "목", "금", "토", "일"]
HHMM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


# ---------------------------------------------------------------- 에러 규약
class ApiError(Exception):
    """명세서 에러 코드로 매핑되는 예외. 라우터 어디서든 raise만 하면 된다."""

    def __init__(self, status: int, code: str, message: str, **extra):
        self.status = status
        self.code = code
        self.message = message
        self.extra = extra


def api_error_handler(_, exc: ApiError):
    body = {"error": {"code": exc.code, "message": exc.message, **exc.extra}}
    return JSONResponse(status_code=exc.status, content=body)


def request_validation_handler(_, exc):
    """FastAPI 기본 422 대신 공통 포맷의 400 VALIDATION_ERROR로 통일."""
    return JSONResponse(
        status_code=400,
        content={"error": {"code": "VALIDATION_ERROR", "message": "요청 형식이 올바르지 않습니다."}},
    )


# 자주 쓰는 에러 헬퍼
def store_not_found():
    return ApiError(404, "STORE_NOT_FOUND", "존재하지 않는 가게입니다.")


def invalid_token():
    return ApiError(403, "INVALID_TOKEN", "편집 토큰이 없거나 일치하지 않습니다.")


def validation_error(message: str):
    return ApiError(400, "VALIDATION_ERROR", message)


# ---------------------------------------------------------------- 토큰 검증
def require_token(store, x_edit_token: str | None):
    """404 확인이 끝난 store에 대해 토큰 검증. 누락/불일치 모두 403 INVALID_TOKEN."""
    if not x_edit_token or x_edit_token != store.edit_token:
        raise invalid_token()


# FastAPI 의존성으로 헤더만 뽑아오는 용도 (검증은 store 조회 뒤에 수동 호출)
def edit_token_header(x_edit_token: str | None = Header(default=None)) -> str | None:
    return x_edit_token


# ---------------------------------------------------------------- basic_info 검증
def validate_basic_info(payload) -> dict:
    """PUT basic-info 부분 갱신용. 보낸 필드만 검증해서 반환. 실패 시 400 VALIDATION_ERROR.

    Pydantic 모델을 안 쓰는 이유: FastAPI 바디 검증은 엔드포인트 진입 전에 돌아서
    404/403보다 400이 먼저 나가버린다. 명세의 검증 순서를 지키려고 수동 검증한다.
    """
    if not isinstance(payload, dict):
        raise validation_error("JSON 객체 본문이 필요합니다.")

    known = {"founded_year", "main_menu", "price", "hours"}
    fields = {k: v for k, v in payload.items() if k in known}
    if not fields:
        raise validation_error("갱신할 필드가 없습니다.")

    if "founded_year" in fields:
        y = fields["founded_year"]
        if not isinstance(y, int) or isinstance(y, bool) or not (1900 <= y <= datetime.now().year):
            raise validation_error(f"founded_year는 1900~{datetime.now().year} 사이 정수여야 합니다.")

    if "main_menu" in fields:
        m = fields["main_menu"]
        if not isinstance(m, str) or not (1 <= len(m.strip()) <= 30):
            raise validation_error("main_menu는 1~30자 문자열이어야 합니다.")
        fields["main_menu"] = m.strip()

    if "price" in fields:
        p = fields["price"]
        if not isinstance(p, int) or isinstance(p, bool) or not (100 <= p <= 10_000_000):
            raise validation_error("price는 100~10,000,000 사이 정수여야 합니다.")

    if "hours" in fields:
        h = fields["hours"]
        if not isinstance(h, dict):
            raise validation_error("hours는 객체여야 합니다.")
        for key in ("open", "close"):
            if key not in h or not isinstance(h[key], str) or not HHMM.match(h[key]):
                raise validation_error(f"hours.{key}는 HH:MM 형식이어야 합니다.")
        closed = h.get("closed_days", [])
        if not isinstance(closed, list) or any(d not in DAYS for d in closed):
            raise validation_error('hours.closed_days는 ["월"~"일"] 배열이어야 합니다. (빈 배열 = 연중무휴)')
        fields["hours"] = {"open": h["open"], "close": h["close"], "closed_days": closed}

    return fields


# ---------------------------------------------------------------- 파일 검증
def file_ext(filename: str | None) -> str:
    if not filename or "." not in filename:
        return ""
    return filename.rsplit(".", 1)[1].lower()


def _ffprobe_duration_seconds(path: str) -> float | None:
    """ffprobe로 재생 길이 측정. ffprobe가 없으면 None(검증 스킵)."""
    if shutil.which("ffprobe") is None:
        return None
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", path],
            capture_output=True, text=True, timeout=15,
        )
        return float(out.stdout.strip())
    except Exception:
        return None


def audio_duration_seconds(path: str) -> float | None:
    """Return duration, using WAV parsing when ffprobe is unavailable."""
    duration = _ffprobe_duration_seconds(path)
    if duration is not None:
        return duration
    if file_ext(path) != "wav":
        return None
    try:
        with wave.open(path, "rb") as audio:
            return audio.getnframes() / audio.getframerate()
    except (wave.Error, OSError, ZeroDivisionError):
        return None
