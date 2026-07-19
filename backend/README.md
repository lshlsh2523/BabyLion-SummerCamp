# BabyLion-SummerCamp Backend — 이슈 #1~#3

FastAPI + SQLite. 명세서 1~4장(가게/사진/핵심정보/음성답변) 구현분.

## 실행

```bash
pip install -r requirements.txt
cp .env.example .env          # 필요 시 값 수정
uvicorn app.main:app --reload --port 8000
```

- 자동 문서: http://localhost:8000/docs — 전 API 클릭 테스트 가능
- 테스트: `python -m pytest tests/ -q` (22개)
- 음성 길이(90초) 검증에 ffmpeg 필요: `brew install ffmpeg` / `apt install ffmpeg`
  (없으면 길이 검증만 스킵하고 서버는 정상 동작)

## 구조

```
app/
├── main.py          앱 조립: 라우터, 예외 핸들러, /media 정적 서빙, CORS
├── core.py          공통 기반: 설정 / 에러 규약 / 토큰 검증 / basic_info 검증
├── db.py            테이블 4개: stores, photos, answers, generation_jobs
├── routers/
│   ├── stores.py    이슈 #1  POST·GET /stores, PUT basic-info
│   ├── photos.py    이슈 #2  업로드(1600px 리사이즈)·삭제, 5장 제한
│   └── answers.py   이슈 #3  음성 업로드 + 동기 STT + question_no 덮어쓰기
└── services/
    └── stt.py       ★ 월요일 교체 지점
```

## 월요일 인수인계 (백2 → 백1)

`app/services/stt.py`의 `transcribe(file_path: str, hint: str) -> str` 내부만
Whisper 호출로 교체하면 끝. 힌트 조립(`build_hint`: 고정 도메인 힌트 +
main_menu 동적 주입)은 이미 구현되어 있음. 호출부는 수정 불필요.

이슈 #5(생성)도 같은 패턴으로 `generate_story(transcripts, basic_info) -> dict`
함수를 services/ 아래에 받을 예정.

## 명세 공백에서 정한 것 (팀 확인 필요)

1. 형식 오류 = **415 UNSUPPORTED_FORMAT**, 용량 초과 = **413 FILE_TOO_LARGE** (사진·음성 동일 체계)
2. 없는 사진 삭제 시 **404 PHOTO_NOT_FOUND** 추가
3. **GET /stores/{id}에도 토큰 필수** — 공통 규약(0장)은 쓰기만 필수라 하지만
   1.2에 헤더가 명시돼 있고 transcript 등 내부 데이터 보호 차원에서 필수로 구현.
   FE 확인 필요 (sessionStorage에 토큰 있으니 헤더만 붙이면 됨)
4. 검증 순서 고정: **404 → 403 → 400** (이 순서 보장을 위해 basic-info는 수동 검증)
5. CORS 전체 허용 (MVP) — 배포 시 도메인 제한
6. edit_token은 **생성 응답에서 1회만 노출**, 조회 응답에 미포함
7. **음성 답변 파일은 private/ (비서빙 경로)에 저장** — 발행 후 store_id가 공개되므로
   /media 하위에 두면 경로 추측만으로 토큰 없이 다운로드가 가능해지는 문제 차단.
   사진은 공개 페이지 표시용이라 /media 유지. 회귀 테스트로 고정 (총 23개)
