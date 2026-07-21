"""음성 -> 텍스트 변환 (STT) — NAVER CLOVA Speech 단문 인식 연동.

문서: https://api.ncloud-docs.com/docs/ai-application-service-clovaspeech-shortsentence
  POST {CLOVA_STT_URL}?lang=Kor
  Content-Type: application/octet-stream
  X-CLOVASPEECH-API-KEY: {Secret Key}
  body: 오디오 바이너리
  response(JSON): { "text": "...", "quota": n, ... }

호출부(routers/answers.py)는 손대지 않는다. 계약은 그대로:
    transcribe(file_path: str, hint: str) -> str

제약(문서 기준):
  - 지원 포맷: mp3/aac/ac3/ogg/flac/wav  → webm 은 미지원이라 ffmpeg 로 wav 변환 후 전송
  - 최대 60초  → 프론트 RECORD_MAX_SEC / core.AUDIO_MAX_SECONDS 도 60 으로 맞출 것
"""
import json
import os
import shutil
import subprocess
import tempfile

import httpx

from ..core import ApiError, file_ext

# ---------------------------------------------------------------- 설정 (비밀값은 .env)
# 인증 헤더/도메인은 앱마다 다를 수 있어 전부 환경변수로 뺀다.
CLOVA_STT_URL = os.environ.get("CLOVA_STT_URL", "https://clovaspeech-gw.ncloud.com/recog/v1/stt")
CLOVA_STT_SECRET = os.environ.get("CLOVA_STT_SECRET", "")
CLOVA_STT_LANG = os.environ.get("CLOVA_STT_LANG", "Kor")
CLOVA_TIMEOUT_SEC = float(os.environ.get("CLOVA_STT_TIMEOUT", "30"))

# CLOVA 단문이 그대로 받는 포맷 (이 외에는 wav 로 변환해서 보낸다)
CLOVA_SUPPORTED = {"mp3", "aac", "ac3", "ogg", "flac", "wav"}

# 고정 도메인 힌트 (명세서 4장 BE 노트) — boostings 로 전달해 인식 정확도 향상
FIXED_HINT = "대전 중앙시장 노포 사장님 인터뷰, 충청도 사투리, 가마솥, 국밥, 대물림"


def build_hint(main_menu: str | None) -> str:
    """고정 힌트 + basic_info.main_menu 가 있으면 동적으로 덧붙인다."""
    if main_menu:
        return f"{FIXED_HINT}, {main_menu}"
    return FIXED_HINT


def _to_boostings(hint: str) -> str:
    """CLOVA boostings 규칙에 맞게 변환: 탭 구분 키워드, 한국어만, 최대 512자."""
    keywords = [kw.strip() for kw in hint.replace(",", "\t").split("\t") if kw.strip()]
    return "\t".join(keywords)[:512]


def _ensure_supported_audio(file_path: str) -> tuple[str, str | None]:
    """CLOVA 가 받는 포맷이면 그대로, 아니면(webm 등) ffmpeg 로 16kHz mono wav 변환.

    Returns (보낼_파일_경로, 정리할_임시파일_경로 | None).
    """
    if file_ext(file_path) in CLOVA_SUPPORTED:
        return file_path, None

    if shutil.which("ffmpeg") is None:
        raise ApiError(503, "AUDIO_TRANSCODE_UNAVAILABLE",
                       "이 음성 형식을 변환하려면 서버에 ffmpeg 가 필요합니다.")

    fd, wav_path = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", file_path, "-ar", "16000", "-ac", "1", wav_path],
            capture_output=True, timeout=30, check=True,
        )
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        if os.path.exists(wav_path):
            os.remove(wav_path)
        raise ApiError(502, "AUDIO_TRANSCODE_FAILED", "음성 형식 변환에 실패했습니다.") from exc
    return wav_path, wav_path


def transcribe(file_path: str, hint: str) -> str:
    """CLOVA 단문 인식으로 음성을 텍스트로 변환. 실패 시 ApiError 로 매핑."""
    if not CLOVA_STT_SECRET:
        raise ApiError(503, "STT_NOT_CONFIGURED", "CLOVA_STT_SECRET 가 설정되지 않았습니다.")

    send_path, temp_path = _ensure_supported_audio(file_path)
    try:
        with open(send_path, "rb") as audio:
            data = audio.read()

        params = {"lang": CLOVA_STT_LANG}
        boostings = _to_boostings(hint)
        if boostings:
            params["boostings"] = boostings

        try:
            response = httpx.post(
                CLOVA_STT_URL,
                params=params,
                headers={
                    "Content-Type": "application/octet-stream",
                    "X-CLOVASPEECH-API-KEY": CLOVA_STT_SECRET,
                },
                content=data,
                timeout=CLOVA_TIMEOUT_SEC,
            )
        except httpx.TimeoutException as exc:
            raise ApiError(504, "STT_TIMEOUT", "음성 인식이 시간 내에 끝나지 않았습니다.") from exc
        except httpx.HTTPError as exc:
            raise ApiError(502, "STT_REQUEST_FAILED", "음성 인식 서버 호출에 실패했습니다.") from exc

        if response.status_code != 200:
            raise ApiError(502, "STT_FAILED", f"CLOVA 오류(status={response.status_code}).")

        try:
            text = (response.json().get("text") or "").strip()
        except (json.JSONDecodeError, ValueError) as exc:
            raise ApiError(502, "STT_BAD_RESPONSE", "음성 인식 응답을 해석할 수 없습니다.") from exc

        # 무음/노이즈로 인식 결과가 비면 재녹음을 유도(생성 파이프라인의 저품질 가드와 연결)
        if not text:
            raise ApiError(422, "STT_EMPTY", "음성이 인식되지 않았어요. 조용한 곳에서 다시 말씀해 주세요.")
        return text
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
