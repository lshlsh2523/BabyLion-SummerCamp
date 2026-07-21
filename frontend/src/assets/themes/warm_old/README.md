# warm_old 에셋 export 체크리스트 (Figma 36:405)

현재 코드는 아래 요소를 CSS/인라인 SVG 근사치로 렌더 중.
Figma에서 export해 이 폴더에 넣고, `WarmOldPage.css` 상단 주석의 교체 지점을 따라 적용.

| 파일명(제안) | 대상 | 포맷 | 적용 위치 |
|---|---|---|---|
| `paper-bg.png` | 종이 질감 배경 (타일 가능하게) | PNG 512px~ | `.wo` — `--wo-paper-img` 주석 해제 |
| `stamp.svg` | SINCE 도장 (연도 텍스트 제외한 테두리만이면 더 좋음) | SVG | `SinceStamp` 컴포넌트 교체 |
| `clip.svg` | 종이 클립 | SVG | `.wo__clip` 교체 |
| `icon-menu.svg` / `icon-price.svg` / `icon-hours.svg` | 정보 카드 아이콘 | SVG | `InfoIcon` 교체 |

## 폰트

- `MapoAgape.woff2` → `src/assets/fonts/`에 두고 CSS의 `@font-face` 주석 해제
  - 배포처: 마포구청 무료 폰트 (라이선스 상업 이용 범위 확인할 것)
  - 미확보 시 Noto Serif KR로 fallback 렌더됨 (현재 상태)

## 주의

- 도장·클립을 이미지로 교체할 때 `mix-blend-mode: multiply` 유지해야 종이에 찍힌 느낌이 남
- trendy_alley의 가게명 그래픽처럼, **가게명이 포함된 에셋은 export 금지** — 가게마다 다름