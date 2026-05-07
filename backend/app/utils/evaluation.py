from typing import List, Dict, Any, Set


def precision_at_k(retrieved_ids: List[int], relevant_ids: Set[int], k: int) -> float:
    if k <= 0 or not retrieved_ids:
        return 0.0
    
    top_k = retrieved_ids[:k]
    relevant_retrieved = sum(1 for doc_id in top_k if doc_id in relevant_ids)
    
    return relevant_retrieved / k


def recall_at_k(retrieved_ids: List[int], relevant_ids: Set[int], k: int) -> float:
    if not relevant_ids or k <= 0:
        return 0.0
    
    top_k = retrieved_ids[:k]
    relevant_retrieved = sum(1 for doc_id in top_k if doc_id in relevant_ids)
    
    return relevant_retrieved / len(relevant_ids)


def context_coverage_score(chunks: List[Dict[str, Any]], query: str) -> float:
    if not chunks or not query:
        return 0.0
    
    query_words = set(query.lower().split())
    
    if not query_words:
        return 0.0
    
    covered_words = set()
    
    for chunk in chunks:
        chunk_text = chunk.get('content', '').lower()
        chunk_words = set(chunk_text.split())
        covered_words.update(query_words.intersection(chunk_words))
    
    coverage = len(covered_words) / len(query_words)
    
    return coverage


def compute_retrieval_confidence(chunks: List[Dict[str, Any]]) -> float:
    if not chunks:
        return 0.0
    
    scores = [chunk.get('score', 0.0) for chunk in chunks]
    
    if not scores:
        return 0.0
    
    top_score = scores[0]
    
    if len(scores) == 1:
        return min(top_score, 1.0)
    
    avg_score = sum(scores) / len(scores)
    
    score_variance = sum((s - avg_score) ** 2 for s in scores) / len(scores)
    
    confidence = top_score * 0.7 + (1 - min(score_variance, 1.0)) * 0.3
    
    return min(confidence, 1.0)
