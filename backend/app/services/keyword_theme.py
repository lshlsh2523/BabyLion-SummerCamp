"""단어 빈도 기반 테마 자동 선택.

프론트엔드의 테마 3종(warm_old / neat_korean / trendy_alley)을 기준으로,
정제 텍스트(스토리 + 인터뷰)에 등장하는 키워드 빈도를 세어 결정적으로 하나를 고른다.
LLM 이 자유롭게 뱉는 theme_id 대신 이 함수 결과로 강제한다.
"""
import re

# 노포 기본 정서상 warm_old 를 기본값으로 둔다(0매칭/동점 시).
DEFAULT_THEME = "warm_old"

# theme_id -> {키워드: 가중치}. 키는 StoryPage 의 THEME_PAGES 키와 반드시 일치.
THEME_KEYWORDS: dict[str, dict[str, int]] = {
    "warm_old": {  # 전통·세월·대물림 (따뜻하고 오래된)
        "가마솥": 3, "전통": 3, "대물림": 3, "물려받": 3, "대대로": 3,
        "세월": 2, "옛날": 2, "역사": 2, "정통": 2, "오래": 2,
        "어머니": 1, "아버지": 1, "할머니": 1, "할아버지": 1,
        "시장": 1, "예전": 1, "3대": 2, "2대": 2, "수십": 2,
    },
    "neat_korean": {  # 정갈한 한식·사연·정성
        "정갈": 3, "정성": 3, "한식": 3, "집밥": 3, "손맛": 2,
        "담백": 2, "건강": 2, "백반": 2, "반찬": 2, "정직": 2,
        "신선": 2, "재료": 1, "손질": 1, "사연": 2, "마음": 1, "밥": 1,
    },
    "trendy_alley": {  # 개성·강렬·트렌디 (젊음·골목)
        "개성": 3, "트렌디": 3, "퓨전": 3, "감성": 2, "골목": 2,
        "강렬": 2, "특별": 2, "새로운": 2, "젊": 2, "요즘": 2,
        "매콤": 1, "매운": 1, "인기": 1, "핫": 1, "인스타": 2, "힙": 2,
    },
}

# 동점 시 우선순위(개성이 강한 테마부터). 기본 정서인 warm_old 는 마지막.
_TIE_ORDER = ["trendy_alley", "neat_korean", "warm_old"]


def classify_theme(text: str | None) -> str:
    """정제 텍스트에서 키워드 빈도로 theme_id 를 결정. 0매칭이면 DEFAULT_THEME."""
    body = (text or "").strip()
    if not body:
        return DEFAULT_THEME

    scores = {theme: 0 for theme in THEME_KEYWORDS}
    for theme, keywords in THEME_KEYWORDS.items():
        for word, weight in keywords.items():
            # 한국어는 어절 경계가 불명확해 부분일치 카운트가 안전
            scores[theme] += len(re.findall(re.escape(word), body)) * weight

    best = max(scores.values())
    if best == 0:
        return DEFAULT_THEME
    return next(theme for theme in _TIE_ORDER if scores.get(theme, 0) == best)
