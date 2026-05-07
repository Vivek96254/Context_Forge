from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.sql import func
from app.db.base import Base


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    content_hash = Column(String, nullable=True, index=True)
    embedding_id = Column(String, nullable=True, index=True)
    start_char = Column(Integer, nullable=True)
    end_char = Column(Integer, nullable=True)
    metadata_ = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
