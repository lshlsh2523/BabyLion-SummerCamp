"""이슈 #1~#3 통합 테스트.

명세서의 정상 흐름(POST -> 업로드 -> PUT -> GET 복구)과
에러 규약(403/404/400/409/413/415/422)을 코드 단위로 고정한다.
"""
import io
import os
import struct
import sys
import tempfile
import wave

import pytest

# 테스트 전용 DB/미디어 경로를 import 전에 주입
_tmp = tempfile.mkdtemp(prefix="babylion_test_")
os.environ["MEDIA_DIR"] = os.path.join(_tmp, "media")
os.environ["PRIVATE_DIR"] = os.path.join(_tmp, "private")
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_tmp, 'test.db')}"

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)
V = "/api/v1"


# ---------------------------------------------------------------- 헬퍼
def make_store():
    r = client.post(f"{V}/stores")
    assert r.status_code == 201
    body = r.json()
    return body["store_id"], body["edit_token"]


def png_bytes(width=800, height=600):
    buf = io.BytesIO()
    Image.new("RGB", (width, height), (200, 120, 40)).save(buf, format="PNG")
    return buf.getvalue()


def wav_bytes(seconds=1.0, rate=8000):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(struct.pack("<h", 0) * int(rate * seconds))
    return buf.getvalue()


def err_code(response):
    return response.json()["error"]["code"]


# ---------------------------------------------------------------- 이슈 #1
def test_create_store_returns_ids():
    store_id, token = make_store()
    assert store_id and token and store_id != token


def test_get_requires_token_and_hides_it():
    store_id, token = make_store()
    assert client.get(f"{V}/stores/{store_id}").status_code == 403
    r = client.get(f"{V}/stores/{store_id}", headers={"X-Edit-Token": "wrong"})
    assert r.status_code == 403 and err_code(r) == "INVALID_TOKEN"

    r = client.get(f"{V}/stores/{store_id}", headers={"X-Edit-Token": token})
    assert r.status_code == 200
    body = r.json()
    assert body["basic_info"] is None and body["photos"] == [] and body["answers"] == []
    assert body["published"] is False and body["story"] is None
    assert "edit_token" not in body  # 토큰은 생성 응답에서만


def test_unknown_store_404_before_token_check():
    r = client.get(f"{V}/stores/no-such-id", headers={"X-Edit-Token": "whatever"})
    assert r.status_code == 404 and err_code(r) == "STORE_NOT_FOUND"


def test_put_basic_info_partial_update():
    store_id, token = make_store()
    h = {"X-Edit-Token": token}

    r = client.put(f"{V}/stores/{store_id}/basic-info", headers=h,
                   json={"main_menu": "가마솥 국밥", "price": 9000})
    assert r.status_code == 200
    assert r.json()["main_menu"] == "가마솥 국밥" and r.json()["founded_year"] is None

    r = client.put(f"{V}/stores/{store_id}/basic-info", headers=h,
                   json={"founded_year": 1984,
                         "hours": {"open": "09:00", "close": "20:00", "closed_days": ["일"]}})
    assert r.status_code == 200
    body = r.json()
    assert body["price"] == 9000  # 이전 값 유지 (부분 갱신)
    assert body["hours"]["closed_days"] == ["일"]


@pytest.mark.parametrize("payload", [
    {"founded_year": 1899},
    {"founded_year": 2099},
    {"main_menu": ""},
    {"main_menu": "가" * 31},
    {"price": 99},
    {"price": 10_000_001},
    {"hours": {"open": "9시", "close": "20:00", "closed_days": []}},
    {"hours": {"open": "09:00", "close": "20:00", "closed_days": ["일요일"]}},
    {},
])
def test_put_basic_info_validation_400(payload):
    store_id, token = make_store()
    r = client.put(f"{V}/stores/{store_id}/basic-info",
                   headers={"X-Edit-Token": token}, json=payload)
    assert r.status_code == 400 and err_code(r) == "VALIDATION_ERROR"


def test_validation_order_404_then_403_then_400():
    # 없는 가게 + 나쁜 본문 -> 404가 이긴다
    r = client.put(f"{V}/stores/ghost/basic-info", json={"price": 1})
    assert r.status_code == 404
    # 있는 가게 + 나쁜 토큰 + 나쁜 본문 -> 403이 이긴다
    store_id, _ = make_store()
    r = client.put(f"{V}/stores/{store_id}/basic-info",
                   headers={"X-Edit-Token": "bad"}, json={"price": 1})
    assert r.status_code == 403


# ---------------------------------------------------------------- 이슈 #2
def test_photo_upload_resize_and_relative_url():
    store_id, token = make_store()
    h = {"X-Edit-Token": token}

    r = client.post(f"{V}/stores/{store_id}/photos", headers=h,
                    files={"file": ("big.png", png_bytes(3200, 800), "image/png")})
    assert r.status_code == 201
    body = r.json()
    assert body["url"].startswith("/media/stores/") and body["sort_order"] == 1

    saved = os.path.join(os.environ["MEDIA_DIR"], body["url"].replace("/media/", ""))
    with Image.open(saved) as img:
        assert max(img.size) == 1600  # 긴 변 1600px 축소
        assert img.size == (1600, 400)  # 비율 유지

    # 정적 서빙 확인
    assert client.get(body["url"]).status_code == 200


def test_photo_limit_5_then_409():
    store_id, token = make_store()
    h = {"X-Edit-Token": token}
    for i in range(5):
        r = client.post(f"{V}/stores/{store_id}/photos", headers=h,
                        files={"file": (f"p{i}.png", png_bytes(), "image/png")})
        assert r.status_code == 201, r.text
        assert r.json()["sort_order"] == i + 1
    r = client.post(f"{V}/stores/{store_id}/photos", headers=h,
                    files={"file": ("p6.png", png_bytes(), "image/png")})
    assert r.status_code == 409 and err_code(r) == "LIMIT_EXCEEDED"


def test_photo_format_and_size_validation():
    store_id, token = make_store()
    h = {"X-Edit-Token": token}
    r = client.post(f"{V}/stores/{store_id}/photos", headers=h,
                    files={"file": ("note.txt", b"hello", "text/plain")})
    assert r.status_code == 415 and err_code(r) == "UNSUPPORTED_FORMAT"
    r = client.post(f"{V}/stores/{store_id}/photos", headers=h,
                    files={"file": ("huge.png", b"0" * (10 * 1024 * 1024 + 1), "image/png")})
    assert r.status_code == 413 and err_code(r) == "FILE_TOO_LARGE"


def test_photo_delete_204_and_404():
    store_id, token = make_store()
    h = {"X-Edit-Token": token}
    r = client.post(f"{V}/stores/{store_id}/photos", headers=h,
                    files={"file": ("a.png", png_bytes(), "image/png")})
    photo_id = r.json()["photo_id"]

    r = client.delete(f"{V}/stores/{store_id}/photos/{photo_id}", headers=h)
    assert r.status_code == 204 and r.content == b""
    r = client.delete(f"{V}/stores/{store_id}/photos/{photo_id}", headers=h)
    assert r.status_code == 404 and err_code(r) == "PHOTO_NOT_FOUND"

    r = client.get(f"{V}/stores/{store_id}", headers=h)
    assert r.json()["photos"] == []


# ---------------------------------------------------------------- 이슈 #3
def test_answer_upload_returns_transcript():
    store_id, token = make_store()
    h = {"X-Edit-Token": token}
    r = client.post(f"{V}/stores/{store_id}/answers", headers=h,
                    data={"question_no": "1"},
                    files={"file": ("q1.wav", wav_bytes(), "audio/wav")})
    assert r.status_code == 201
    body = r.json()
    assert body["question_no"] == 1 and body["transcript"]


def test_answer_upsert_same_question_no():
    store_id, token = make_store()
    h = {"X-Edit-Token": token}
    for _ in range(2):  # 같은 질문 재업로드 = 덮어쓰기
        r = client.post(f"{V}/stores/{store_id}/answers", headers=h,
                        data={"question_no": "2"},
                        files={"file": ("q2.wav", wav_bytes(), "audio/wav")})
        assert r.status_code == 201
    r = client.get(f"{V}/stores/{store_id}", headers=h)
    answers = r.json()["answers"]
    assert len(answers) == 1 and answers[0]["question_no"] == 2


def test_answer_validation_errors():
    store_id, token = make_store()
    h = {"X-Edit-Token": token}
    r = client.post(f"{V}/stores/{store_id}/answers", headers=h,
                    data={"question_no": "4"},
                    files={"file": ("q.wav", wav_bytes(), "audio/wav")})
    assert r.status_code == 400 and err_code(r) == "VALIDATION_ERROR"

    r = client.post(f"{V}/stores/{store_id}/answers", headers=h,
                    data={"question_no": "1"},
                    files={"file": ("q.txt", b"x", "text/plain")})
    assert r.status_code == 415 and err_code(r) == "UNSUPPORTED_FORMAT"

    r = client.post(f"{V}/stores/{store_id}/answers", headers=h,
                    data={"question_no": "1"},
                    files={"file": ("q.wav", b"0" * (15 * 1024 * 1024 + 1), "audio/wav")})
    assert r.status_code == 413 and err_code(r) == "FILE_TOO_LARGE"


@pytest.mark.skipif(__import__("shutil").which("ffprobe") is None,
                    reason="ffprobe 없으면 길이 검증 스킵")
def test_answer_too_long_422():
    store_id, token = make_store()
    r = client.post(f"{V}/stores/{store_id}/answers",
                    headers={"X-Edit-Token": token},
                    data={"question_no": "3"},
                    files={"file": ("long.wav", wav_bytes(seconds=91), "audio/wav")})
    assert r.status_code == 422 and err_code(r) == "AUDIO_TOO_LONG"


def test_answer_audio_not_publicly_served():
    """보안 회귀 테스트: 음성 파일은 /media 경로 추측으로 내려받을 수 없어야 한다.

    발행 후 store_id가 공개(/s/{store_id})되므로, 음성이 /media 하위에 있으면
    q1~q3 x 확장자 조합만으로 토큰 없이 다운로드 가능해진다 (명세 6.2 취지 위반).
    """
    store_id, token = make_store()
    r = client.post(f"{V}/stores/{store_id}/answers",
                    headers={"X-Edit-Token": token},
                    data={"question_no": "1"},
                    files={"file": ("q1.wav", wav_bytes(), "audio/wav")})
    assert r.status_code == 201

    # 예전 취약 경로로 접근 시도 -> 서빙되지 않아야 함
    assert client.get(f"/media/answers/{store_id}/q1.wav").status_code == 404

    # 파일은 비공개 저장소(PRIVATE_DIR)에 실제로 존재
    assert os.path.exists(
        os.path.join(os.environ["PRIVATE_DIR"], "answers", store_id, "q1.wav"))
