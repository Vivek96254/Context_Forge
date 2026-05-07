from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.services.embedding_provider import get_embedding_provider
from app.services.vector_store import get_vector_store
from app.services.query_rewriter import get_query_rewriter
from app.services.metrics_service import get_metrics_service
from app.utils.bm25 import get_bm25_index
from app.utils.evaluation import compute_retrieval_confidence
from app.models.chunk import Chunk
from app.models.document import Document
from app.models.user import User
from app.core.access_control import AccessControl
from app.core.config import settings
import time
import logging
import json

logger = logging.getLogger(__name__)


class RetrievalService:
    def __init__(self, db: Session):
        self.db = db
        self.embedding_provider = get_embedding_provider()
        self.vector_store = get_vector_store()
        self.bm25_index = get_bm25_index()
        self.query_rewriter = get_query_rewriter()
        self.metrics_service = get_metrics_service()
    
    def retrieve(
        self,
        query: str,
        top_k: int = None,
        user: User = None
    ) -> tuple[List[Dict[str, Any]], str, float]:
        if top_k is None:
            top_k = settings.TOP_K
        
        if not user:
            logger.error("User not provided for retrieval, security violation")
            return [], query, 0.0
        
        retrieval_start = time.time()
        
        rewritten_query = self.query_rewriter.rewrite_query(query)
        
        vector_results = self._vector_search(rewritten_query, top_k * 3)
        
        bm25_results = self._bm25_search(rewritten_query, top_k * 3)
        
        merged_results = self._merge_and_rank(
            vector_results,
            bm25_results
        )
        
        filtered_results = self._apply_rbac_filter(merged_results, user)
        
        final_results = filtered_results[:top_k]
        
        filtered_count = len(merged_results) - len(filtered_results)
        
        confidence = compute_retrieval_confidence(final_results)
        
        retrieval_time_ms = (time.time() - retrieval_start) * 1000
        
        self.metrics_service.record_metric(
            "retrieval_latency_ms",
            retrieval_time_ms,
            {
                "user_id": user.id,
                "chunks_retrieved": len(final_results),
                "chunks_filtered": filtered_count,
                "confidence": confidence
            }
        )
        
        log_data = {
            "event_type": "retrieval",
            "user_id": user.id,
            "query_length": len(query),
            "chunks_retrieved": len(final_results),
            "chunks_filtered_by_rbac": filtered_count,
            "confidence_score": confidence,
            "latency_ms": retrieval_time_ms
        }
        
        logger.info(json.dumps(log_data))
        
        if filtered_count > 0:
            logger.warning(
                f"RBAC filtered {filtered_count} unauthorized chunks for user {user.id}"
            )
        
        return final_results, rewritten_query, confidence
    
    def _vector_search(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        if self.vector_store.get_total_vectors() == 0:
            logger.warning("FAISS index is empty")
            return []
        
        try:
            embedding_start = time.time()
            query_embedding = self.embedding_provider.embed([query])[0]
            embedding_time_ms = (time.time() - embedding_start) * 1000
            
            self.metrics_service.record_metric(
                "embedding_latency_ms",
                embedding_time_ms
            )
            
            faiss_results = self.vector_store.search(query_embedding, top_k=top_k)
            
            for result in faiss_results:
                result['source'] = 'vector'
            
            return faiss_results
        except Exception as e:
            logger.error(f"Error in vector search: {e}")
            return []
    
    def _bm25_search(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        if self.bm25_index.get_total_documents() == 0:
            logger.warning("BM25 index is empty")
            return []
        
        try:
            bm25_results = self.bm25_index.search(query, top_k=top_k)
            
            for result in bm25_results:
                result['source'] = 'bm25'
            
            return bm25_results
        except Exception as e:
            logger.error(f"Error in BM25 search: {e}")
            return []
    
    def _normalize_scores(self, results: List[Dict[str, Any]], source: str) -> List[Dict[str, Any]]:
        if not results:
            return results
        
        scores = [r['score'] for r in results]
        
        if len(scores) == 1:
            max_score = scores[0]
            min_score = scores[0]
        else:
            max_score = max(scores)
            min_score = min(scores)
        
        if max_score == min_score:
            for result in results:
                result['normalized_score'] = 1.0
        else:
            for result in results:
                result['normalized_score'] = (result['score'] - min_score) / (max_score - min_score)
        
        return results
    
    def _merge_and_rank(
        self,
        vector_results: List[Dict[str, Any]],
        bm25_results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        vector_results = self._normalize_scores(vector_results, 'vector')
        bm25_results = self._normalize_scores(bm25_results, 'bm25')
        
        chunk_scores = {}
        chunk_sources = {}
        
        alpha = settings.HYBRID_ALPHA
        
        for result in vector_results:
            chunk_id = result['chunk_id']
            chunk_scores[chunk_id] = alpha * result['normalized_score']
            chunk_sources[chunk_id] = {'vector': result['normalized_score'], 'bm25': 0.0}
        
        for result in bm25_results:
            chunk_id = result['chunk_id']
            if chunk_id in chunk_scores:
                chunk_scores[chunk_id] += (1 - alpha) * result['normalized_score']
                chunk_sources[chunk_id]['bm25'] = result['normalized_score']
            else:
                chunk_scores[chunk_id] = (1 - alpha) * result['normalized_score']
                chunk_sources[chunk_id] = {'vector': 0.0, 'bm25': result['normalized_score']}
        
        sorted_chunk_ids = sorted(chunk_scores.keys(), key=lambda x: chunk_scores[x], reverse=True)
        
        chunks = self.db.query(Chunk).filter(Chunk.id.in_(sorted_chunk_ids)).all()
        chunk_map = {chunk.id: chunk for chunk in chunks}
        
        document_ids = [chunk.document_id for chunk in chunks]
        documents = self.db.query(Document).filter(Document.id.in_(document_ids)).all()
        document_map = {doc.id: doc for doc in documents}
        
        results = []
        for chunk_id in sorted_chunk_ids:
            chunk = chunk_map.get(chunk_id)
            
            if not chunk:
                continue
            
            document = document_map.get(chunk.document_id)
            
            if not document:
                continue
            
            final_score = chunk_scores[chunk_id]
            sources = chunk_sources[chunk_id]
            
            results.append({
                'chunk_id': chunk.id,
                'document_id': document.id,
                'document': document,
                'filename': document.filename,
                'chunk_index': chunk.chunk_index,
                'content': chunk.content,
                'score': final_score,
                'vector_score': sources['vector'],
                'bm25_score': sources['bm25']
            })
            
            logger.debug(
                f"Chunk {chunk_id}: final={final_score:.3f}, "
                f"vector={sources['vector']:.3f}, bm25={sources['bm25']:.3f}"
            )
        
        return results
    
    def _apply_rbac_filter(
        self,
        results: List[Dict[str, Any]],
        user: User
    ) -> List[Dict[str, Any]]:
        authorized_results = []
        accessed_document_ids = set()
        
        for result in results:
            document = result['document']
            
            if AccessControl.can_access_document(user, document):
                authorized_results.append(result)
                accessed_document_ids.add(document.id)
            else:
                logger.debug(
                    f"RBAC: User {user.id} denied access to document {document.id} "
                    f"(access_level={document.access_level}, owner_id={document.owner_id})"
                )
        
        if accessed_document_ids:
            logger.info(
                f"RBAC: User {user.id} accessed documents: {list(accessed_document_ids)}"
            )
        
        return authorized_results
