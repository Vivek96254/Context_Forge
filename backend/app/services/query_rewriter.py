from typing import Optional
from app.services.llm_provider import get_llm_provider
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class QueryRewriter:
    def __init__(self):
        self.llm_provider = get_llm_provider()
        self.max_query_length = 500
    
    def rewrite_query(self, query: str) -> str:
        if not settings.ENABLE_QUERY_REWRITING:
            logger.info("Query rewriting disabled, using original query")
            return query
        
        if not query or len(query.strip()) == 0:
            logger.warning("Empty query provided to rewriter")
            return query
        
        try:
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are a search query optimizer for a knowledge retrieval system. "
                        "Your task is to rewrite user queries to improve search accuracy. "
                        "Rewrite the query to be more specific, detailed, and include relevant keywords "
                        "while preserving the original intent. "
                        "Return ONLY the rewritten query, nothing else."
                    )
                },
                {
                    "role": "user",
                    "content": f"Rewrite this search query to be more effective:\n\n{query}"
                }
            ]
            
            rewritten_query = self.llm_provider.generate_response(messages)
            
            rewritten_query = rewritten_query.strip().strip('"').strip("'")
            
            if len(rewritten_query) > self.max_query_length:
                logger.warning(f"Rewritten query too long ({len(rewritten_query)} chars), truncating")
                rewritten_query = rewritten_query[:self.max_query_length]
            
            if not rewritten_query or len(rewritten_query) < 3:
                logger.warning("Rewritten query too short, using original")
                return query
            
            logger.info(f"Query rewritten: '{query}' -> '{rewritten_query}'")
            
            return rewritten_query
            
        except Exception as e:
            logger.error(f"Error rewriting query: {e}, using original query")
            return query


_query_rewriter_instance = None


def get_query_rewriter() -> QueryRewriter:
    global _query_rewriter_instance
    
    if _query_rewriter_instance is None:
        _query_rewriter_instance = QueryRewriter()
    
    return _query_rewriter_instance
