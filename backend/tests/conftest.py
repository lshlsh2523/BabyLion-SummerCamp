"""테스트 공통 픽스처.

STT(CLOVA)는 외부 호출이라 테스트에서 실제로 부르지 않는다.
answers 라우터가 참조하는 transcribe 를 고정 문자열 스텁으로 자동 치환한다.
개별 테스트가 monkeypatch 로 다시 덮으면 그쪽이 우선한다.
"""
import pytest

from app.routers import answers as answers_router


@pytest.fixture(autouse=True)
def stub_transcribe(monkeypatch):
    monkeypatch.setattr(
        answers_router,
        "transcribe",
        lambda *_args, **_kwargs: "(테스트 변환) 사십 년째 같은 자리서 어머니한테 물려받아서 하고 있어유",
    )
