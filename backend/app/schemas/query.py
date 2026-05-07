from typing import List, Optional
from pydantic import BaseModel


class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5


class SourceReference(BaseModel):
    document_id: int
    filename: str
    chunk_index: int
    content: str
    score: float


class QueryResponse(BaseModel):
    query: str
    rewritten_query: Optional[str] = None
    answer: str
    sources: List[SourceReference]
    retrieval_time_ms: float
    generation_time_ms: float
    confidence: Optional[float] = None
