from sqlalchemy import Column, Integer, String, DateTime, Float, Text
from sqlalchemy.sql import func
from app.db.base import Base


class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    original_query = Column(Text, nullable=False)
    rewritten_query = Column(Text, nullable=True)
    retrieved_chunk_count = Column(Integer, nullable=False)
    chunks_after_rbac = Column(Integer, nullable=False)
    response_time_ms = Column(Float, nullable=False)
    retrieval_time_ms = Column(Float, nullable=False)
    generation_time_ms = Column(Float, nullable=False)
    provider_used = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=True)
    context_tokens = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
