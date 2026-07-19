"""음성 -> 텍스트 변환 (STT).

[역할분담 5.1-8] 오늘은 고정 문자열 스텁. 월요일에 백2(허준성)의 Whisper 함수로
이 파일의 transcribe() 내부만 교체한다. 시그니처는 백2와 합의된 계약:

    transcribe(file_path: str, hint: str) -> str

호출부(routers/answers.py)는 손대지 않아도 되도록 힌트 조립까지 여기서 끝낸다.
"""

# 고정 도메인 힌트 (명세서 4장 BE 노트)
FIXED_HINT = "대전 중앙시장 노포 사장님 인터뷰, 충청도 사투리, 가마솥, 국밥, 대물림"


def build_hint(main_menu: str | None) -> str:
    """고정 힌트 + basic_info.main_menu가 있으면 동적으로 덧붙인다."""
    if main_menu:
        return f"{FIXED_HINT}, {main_menu}"
    return FIXED_HINT


def transcribe(file_path: str, hint: str) -> str:
    """TODO(월요일): 백2 Whisper API 함수 호출로 교체. 지금은 임시 고정 문자열."""
    return "(임시 변환) 사십 년째 같은 자리서 어머니한테 물려받아서 하고 있어유"
