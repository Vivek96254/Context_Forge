from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.query import QueryRequest, QueryResponse
from app.services.retrieval_service import RetrievalService
from app.services.rag_service import RAGService
from app.services.metrics_service import get_metrics_service
from app.models.user import User
from app.models.query_log import QueryLog
from app.core.config import settings
import time
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/query", tags=["query"])


async def get_current_user_mock() -> User:
    mock_user = User()
    mock_user.id = 1
    mock_user.email = "test@example.com"
    mock_user.username = "testuser"
    mock_user.role = "user"
    return mock_user


@router.post("/", response_model=QueryResponse)
async def query_documents(
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_mock)
):
    if not request.query or len(request.query.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty"
        )
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    metrics_service = get_metrics_service()
    overall_start = time.time()
    
    try:
        retrieval_start = time.time()
        
        retrieval_service = RetrievalService(db)
        retrieved_chunks, rewritten_query, confidence = retrieval_service.retrieve(
            query=request.query,
            top_k=request.top_k,
            user=current_user
        )
        
        retrieval_time_ms = (time.time() - retrieval_start) * 1000
        
        rag_service = RAGService()
        response = rag_service.generate_answer(
            query=request.query,
            retrieved_chunks=retrieved_chunks,
            retrieval_time_ms=retrieval_time_ms,
            rewritten_query=rewritten_query,
            confidence=confidence
        )
        
        total_time_ms = (time.time() - overall_start) * 1000
        
        query_log = QueryLog(
            user_id=current_user.id,
            original_query=request.query,
            rewritten_query=rewritten_query,
            retrieved_chunk_count=len(retrieved_chunks),
            chunks_after_rbac=len(retrieved_chunks),
            response_time_ms=total_time_ms,
            retrieval_time_ms=retrieval_time_ms,
            generation_time_ms=response.generation_time_ms,
            provider_used=settings.LLM_PROVIDER,
            confidence_score=confidence,
            context_tokens=None
        )
        db.add(query_log)
        db.commit()
        
        metrics_service.record_metric(
            "query_latency_ms",
            total_time_ms,
            {
                "user_id": current_user.id,
                "provider": settings.LLM_PROVIDER,
                "chunks_retrieved": len(retrieved_chunks),
                "confidence": confidence
            }
        )
        
        log_data = {
            "event_type": "query_complete",
            "user_id": current_user.id,
            "query_length": len(request.query),
            "chunks_retrieved": len(retrieved_chunks),
            "confidence": confidence,
            "provider": settings.LLM_PROVIDER,
            "total_latency_ms": total_time_ms,
            "retrieval_latency_ms": retrieval_time_ms,
            "generation_latency_ms": response.generation_time_ms
        }
        
        logger.info(json.dumps(log_data))
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing query for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process query"
        )
