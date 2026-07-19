"""BabyLion-SummerCamp 백엔드 진입점.

실행:  uvicorn app.main:app --reload --port 8000
문서:  http://localhost:8000/docs  (전 API 클릭 테스트 가능 — 역할분담 5.1-1)
"""
import os

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core import (MEDIA_DIR, PRIVATE_DIR, ApiError, api_error_handler,
                   request_validation_handler)
from .db import Base, engine
from .routers import answers, photos, stores

Base.metadata.create_all(bind=engine)
os.makedirs(MEDIA_DIR, exist_ok=True)
os.makedirs(PRIVATE_DIR, exist_ok=True)

app = FastAPI(title="BabyLion-SummerCamp API", version="0.1.0")

# FE 로컬 개발용 — 캠프 MVP라 전체 허용, 배포 시 도메인 제한
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(ApiError, api_error_handler)
app.add_exception_handler(RequestValidationError, request_validation_handler)

# 공개 파일(사진) 서빙 — 응답 url은 /media/... 상대 경로, FE가 HOST를 붙인다 (명세서 0장)
# 음성 답변은 PRIVATE_DIR에 저장되어 여기서 서빙되지 않는다 (경로 추측 다운로드 차단)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

API_PREFIX = "/api/v1"
app.include_router(stores.router, prefix=API_PREFIX, tags=["stores"])
app.include_router(photos.router, prefix=API_PREFIX, tags=["photos"])
app.include_router(answers.router, prefix=API_PREFIX, tags=["answers"])
