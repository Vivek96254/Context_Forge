from typing import List, Dict, Any, Optional
import time
import tiktoken
from app.services.llm_provider import get_llm_provider
from app.services.metrics_service import get_metrics_service
from app.schemas.query import QueryResponse, SourceReference
from app.core.config import settings
import logging
import json

logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self):
        self.llm_provider = get_llm_provider()
        self.encoding = tiktoken.get_encoding("cl100k_base")
        self.metrics_service = get_metrics_service()
    
    def generate_answer(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        retrieval_time_ms: float,
        rewritten_query: Optional[str] = None,
        confidence: float = 0.0
    ) -> QueryResponse:
        if not retrieved_chunks:
            return QueryResponse(
                query=query,
                rewritten_query=rewritten_query,
                answer="I don't have any relevant information to answer your question.",
                sources=[],
                retrieval_time_ms=retrieval_time_ms,
                generation_time_ms=0.0,
                confidence=confidence
            )
        
        start_time = time.time()
        
        context, context_tokens = self._build_context(retrieved_chunks)
        
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant that answers questions based ONLY on the provided context. "
                    "You must cite your sources by referencing the document name and chunk number. "
                    "If the context does not contain enough information to answer the question, "
                    "say 'I don't have enough information in the provided documents to answer this question.' "
                    "Do not make up information or use knowledge outside the provided context."
                )
            },
            {
                "role": "user",
                "content": f"Context:\n\n{context}\n\nQuestion: {query}\n\nProvide a detailed answer based on the context above, citing specific documents and chunks."
            }
        ]
        
        provider_name = settings.LLM_PROVIDER
        
        try:
            answer = self.llm_provider.generate_response(messages)
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            answer = "An error occurred while generating the answer. Please try again."
        
        generation_time_ms = (time.time() - start_time) * 1000
        
        self.metrics_service.record_metric(
            "generation_latency_ms",
            generation_time_ms,
            {
                "provider": provider_name,
                "context_tokens": context_tokens,
                "chunks_count": len(retrieved_chunks)
            }
        )
        
        log_data = {
            "event_type": "generation",
            "provider": provider_name,
            "context_tokens": context_tokens,
            "chunks_used": len(retrieved_chunks),
            "latency_ms": generation_time_ms
        }
        
        logger.info(json.dumps(log_data))
        
        sources = [
            SourceReference(
                document_id=chunk["document_id"],
                filename=chunk["filename"],
                chunk_index=chunk["chunk_index"],
                content=chunk["content"][:200] + "..." if len(chunk["content"]) > 200 else chunk["content"],
                score=chunk["score"]
            )
            for chunk in retrieved_chunks
        ]
        
        return QueryResponse(
            query=query,
            rewritten_query=rewritten_query,
            answer=answer,
            sources=sources,
            retrieval_time_ms=retrieval_time_ms,
            generation_time_ms=generation_time_ms,
            confidence=confidence
        )
    
    def _build_context(self, chunks: List[Dict[str, Any]]) -> tuple[str, int]:
        context_parts = []
        total_tokens = 0
        max_tokens = settings.MAX_CONTEXT_TOKENS
        
        for idx, chunk in enumerate(chunks, 1):
            chunk_text = f"[Document: {chunk['filename']}, Chunk {chunk['chunk_index']}]\n{chunk['content']}"
            
            chunk_tokens = len(self.encoding.encode(chunk_text))
            
            if total_tokens + chunk_tokens > max_tokens:
                logger.warning(f"Reached max context tokens ({max_tokens}), truncating at {idx} chunks")
                break
            
            context_parts.append(chunk_text)
            total_tokens += chunk_tokens
        
        return "\n\n---\n\n".join(context_parts), total_tokens
