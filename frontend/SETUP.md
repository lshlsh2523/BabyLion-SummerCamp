# 노포 스토리 프론트엔드 — 세팅 가이드

## 적용 방법
레포 루트에서:
```bash
# 이 압축을 풀어 frontend/ 폴더로 배치 후
cd frontend
npm install
npm run dev              # http://localhost:5173
npm run dev -- --host    # 실기기(안드로이드 크롬) 접속용
```

## 지금 동작하는 것 (mock 기준)
- 스플래시 탭 → P0 → P1(사진 3장, 실제 카메라/갤러리) → P2(4단계)
  → P3(실제 마이크 녹음, 90초 자동정지) → P4(3초 생성 대기)
  → P5(확인/재생성) → P6(발행) → /s/{id} 공개 페이지까지 전체 완주
- TTS 음성 안내(useSpeak), 진동 피드백, 새로고침 복구(sessionStorage)
- PUB 테마 3종 CSS 변수 전환 (theme_id 클래스만 교체)

## 월요일 연동 시 교체 지점 (단 1곳)
`src/api/client.js` — 각 함수 내부의 mockApi 호출을 실제 fetch로 교체.
X-Edit-Token 헤더, BASE URL 주석 참고. 페이지 코드는 수정 불필요.

## mock으로 남겨둔 부분 (연동 때 확인)
- P2 ② 대표 메뉴: 마이크 탭 시 예시 텍스트("가마솥 국밥") 저장
  → 월요일에 useRecorder + POST /answers 응답 transcript 연동
- P3 업로드 지연 1.5초로 단축 (실제 5~15초 — 로딩 문구 이미 있음)
- 사진 URL이 blob: (로컬 미리보기) — 서버 연동 시 /media 경로로 자동 전환됨

## 시안 대비 변경점 (팀 공유 필요)
- 스플래시: 자동 전환 → 화면 탭으로 변경.
  Chrome 정책상 사용자 탭 이전에는 TTS 재생이 차단되기 때문 (첫 제스처 확보).
