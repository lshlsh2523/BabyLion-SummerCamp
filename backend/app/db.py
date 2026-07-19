"""SQLite 연결 + 테이블 4개: stores / photos / answers / generation_jobs.

필드는 API 명세서의 응답 형식을 역산해 정의 (역할분담 5.1-2).
generation_jobs는 이슈 #4 대상이지만 스키마는 지금 확정해둔다.
"""
import uuid
from datetime import datetime

from sqlalchemy import (JSON, Boolean, Column, DateTime, ForeignKey, Integer,
                        String, Text, UniqueConstraint, create_engine)
from sqlalchemy.orm import declarative_base, sessionmaker

from .core import DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def new_uuid() -> str:
    return str(uuid.uuid4())


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Store(Base):
    __tablename__ = "stores"

    store_id = Column(String, primary_key=True, default=new_uuid)
    edit_token = Column(String, nullable=False, default=new_uuid)
    published = Column(Boolean, nullable=False, default=False)
    # basic_info (전부 미입력 시 응답에서 basic_info: null)
    founded_year = Column(Integer, nullable=True)
    main_menu = Column(String(30), nullable=True)
    price = Column(Integer, nullable=True)
    hours = Column(JSON, nullable=True)          # {open, close, closed_days[]}
    # 생성 결과 (이슈 #5에서 채움)
    story = Column(JSON, nullable=True)          # 5.3 스키마
    public_url = Column(String, nullable=True)   # 발행 시 /s/{store_id}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def basic_info(self) -> dict | None:
        if all(v is None for v in (self.founded_year, self.main_menu, self.price, self.hours)):
            return None
        return {
            "founded_year": self.founded_year,
            "main_menu": self.main_menu,
            "price": self.price,
            "hours": self.hours,
        }


class Photo(Base):
    __tablename__ = "photos"

    photo_id = Column(String, primary_key=True, default=new_uuid)
    store_id = Column(String, ForeignKey("stores.store_id"), nullable=False, index=True)
    path = Column(String, nullable=False)        # 서버 로컬 경로
    url = Column(String, nullable=False)         # /media/... 상대 경로 (FE가 HOST를 붙임)
    sort_order = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Answer(Base):
    __tablename__ = "answers"
    __table_args__ = (UniqueConstraint("store_id", "question_no", name="uq_store_question"),)

    answer_id = Column(String, primary_key=True, default=new_uuid)
    store_id = Column(String, ForeignKey("stores.store_id"), nullable=False, index=True)
    question_no = Column(Integer, nullable=False)  # 1: 언제부터 / 2: 대표메뉴·비결 / 3: 자부심
    path = Column(String, nullable=False)
    transcript = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class GenerationJob(Base):
    __tablename__ = "generation_jobs"

    job_id = Column(String, primary_key=True, default=new_uuid)
    store_id = Column(String, ForeignKey("stores.store_id"), nullable=False, index=True)
    status = Column(String, nullable=False, default="pending")  # pending/processing/done/failed
    error = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
