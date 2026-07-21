# BabyLion-SummerCamp Backend

FastAPI와 SQLite 기반 API입니다. 가게 생성, 사진·음성 답변 업로드, 스토리 생성, 발행을 제공합니다.

Python 3.10 이상이 필요합니다.

## 실행

```powershell
pip install -r requirements.txt
$env:OPENAI_API_KEY = "your-api-key" # 스토리 생성 기능을 사용할 때만 필요
uvicorn app.main:app --reload --port 8000
```

- API 문서: `http://localhost:8000/docs`
- 테스트: `python -m pytest tests/ -q`
- 생성 모델은 `OPENAI_MODEL` 환경 변수로 변경할 수 있으며, 기본값은 `gpt-4o`입니다.
- CORS 허용 도메인은 `CORS_ORIGINS` 환경 변수에 쉼표로 구분해 설정합니다.
- 기본 DB·미디어 경로는 backend 폴더를 기준으로 하므로, 실행 위치가 달라도 같은 데이터를 사용합니다.
- WAV 파일은 내장 검사로 길이를 검증합니다. webm·mp3·m4a는 `ffprobe`가 필요하며, 없으면 업로드가 `503 AUDIO_DURATION_UNAVAILABLE`으로 거절됩니다.

## 주요 경로

- `POST /api/v1/stores`
- `POST /api/v1/stores/{store_id}/photos`
- `POST /api/v1/stores/{store_id}/answers`
- `POST /api/v1/stores/{store_id}/generate`
- `GET /api/v1/jobs/{job_id}`
- `POST /api/v1/stores/{store_id}/publish`

`OPENAI_API_KEY`는 코드나 저장소에 기록하지 말고 실행 환경에서만 설정하세요.
