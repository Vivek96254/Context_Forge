from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.query_log import QueryLog
from app.services.metrics_service import get_metrics_service
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/", response_model=Dict[str, Any])
async def get_metrics(
    window_hours: int = 24,
    db: Session = Depends(get_db)
):
    metrics_service = get_metrics_service()
    
    window_seconds = window_hours * 3600
    
    runtime_metrics = metrics_service.get_all_metrics_summary(window_seconds)
    
    query_logs = db.query(QueryLog).order_by(QueryLog.created_at.desc()).limit(1000).all()
    
    total_queries = len(query_logs)
    
    if total_queries == 0:
        return {
            "window_hours": window_hours,
            "total_queries": 0,
            "average_latencies": {},
            "confidence_stats": {},
            "provider_distribution": {},
            "runtime_metrics": runtime_metrics
        }
    
    avg_response_time = sum(log.response_time_ms for log in query_logs) / total_queries
    avg_retrieval_time = sum(log.retrieval_time_ms for log in query_logs) / total_queries
    avg_generation_time = sum(log.generation_time_ms for log in query_logs) / total_queries
    
    avg_chunks_retrieved = sum(log.retrieved_chunk_count for log in query_logs) / total_queries
    avg_chunks_after_rbac = sum(log.chunks_after_rbac for log in query_logs) / total_queries
    
    confidence_scores = [log.confidence_score for log in query_logs if log.confidence_score is not None]
    
    if confidence_scores:
        avg_confidence = sum(confidence_scores) / len(confidence_scores)
        min_confidence = min(confidence_scores)
        max_confidence = max(confidence_scores)
        sorted_confidence = sorted(confidence_scores)
        p50_confidence = sorted_confidence[len(sorted_confidence) // 2]
    else:
        avg_confidence = 0.0
        min_confidence = 0.0
        max_confidence = 0.0
        p50_confidence = 0.0
    
    provider_counts = {}
    for log in query_logs:
        provider = log.provider_used
        provider_counts[provider] = provider_counts.get(provider, 0) + 1
    
    return {
        "window_hours": window_hours,
        "total_queries": total_queries,
        "average_latencies": {
            "response_time_ms": round(avg_response_time, 2),
            "retrieval_time_ms": round(avg_retrieval_time, 2),
            "generation_time_ms": round(avg_generation_time, 2)
        },
        "chunks_stats": {
            "avg_retrieved": round(avg_chunks_retrieved, 2),
            "avg_after_rbac": round(avg_chunks_after_rbac, 2)
        },
        "confidence_stats": {
            "avg": round(avg_confidence, 3),
            "min": round(min_confidence, 3),
            "max": round(max_confidence, 3),
            "p50": round(p50_confidence, 3)
        },
        "provider_distribution": provider_counts,
        "runtime_metrics": runtime_metrics
    }


@router.get("/queries/recent", response_model=Dict[str, Any])
async def get_recent_queries(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    recent_logs = db.query(QueryLog).order_by(
        QueryLog.created_at.desc()
    ).limit(limit).all()
    
    queries = []
    for log in recent_logs:
        queries.append({
            "id": log.id,
            "user_id": log.user_id,
            "original_query": log.original_query[:100],
            "chunks_retrieved": log.retrieved_chunk_count,
            "response_time_ms": log.response_time_ms,
            "confidence": log.confidence_score,
            "provider": log.provider_used,
            "timestamp": log.created_at.isoformat()
        })
    
    return {
        "count": len(queries),
        "queries": queries
    }
