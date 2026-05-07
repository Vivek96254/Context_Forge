import os
import pickle
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class BM25Index:
    def __init__(self):
        self.bm25: Optional[BM25Okapi] = None
        self.chunk_ids: List[int] = []
        self.corpus: List[List[str]] = []
        self._index_mtime: Optional[float] = None
        self._load_index()
    
    def _tokenize(self, text: str) -> List[str]:
        return text.lower().split()
    
    def _load_index(self):
        if os.path.exists(settings.BM25_INDEX_PATH):
            try:
                with open(settings.BM25_INDEX_PATH, 'rb') as f:
                    data = pickle.load(f)
                    self.chunk_ids = data['chunk_ids']
                    self.corpus = data['corpus']
                    
                    if self.corpus:
                        self.bm25 = BM25Okapi(self.corpus)
                        self._index_mtime = os.path.getmtime(settings.BM25_INDEX_PATH)
                        logger.info(f"Loaded BM25 index with {len(self.chunk_ids)} documents")
                    else:
                        logger.info("BM25 index file exists but corpus is empty")
            except Exception as e:
                logger.error(f"Error loading BM25 index: {e}")
                self._initialize_empty()
        else:
            logger.info("No existing BM25 index found, starting fresh")
            self._initialize_empty()
    
    def _initialize_empty(self):
        self.bm25 = None
        self.chunk_ids = []
        self.corpus = []
        self._index_mtime = None

    def _maybe_reload_index(self):
        """
        The ingestion worker updates the BM25 pickle on disk, but this API process
        keeps a singleton BM25Index in memory. Reload when the pickle changes.
        """
        try:
            if not os.path.exists(settings.BM25_INDEX_PATH):
                return
            
            mtime = os.path.getmtime(settings.BM25_INDEX_PATH)
            if self._index_mtime is None:
                self._load_index()
                return
            
            if mtime != self._index_mtime:
                logger.info("BM25 index changed on disk, reloading")
                self._load_index()
        except Exception as e:
            logger.warning(f"Failed to auto-reload BM25 index: {e}")
    
    def _save_index(self):
        os.makedirs(os.path.dirname(settings.BM25_INDEX_PATH), exist_ok=True)
        
        data = {
            'chunk_ids': self.chunk_ids,
            'corpus': self.corpus
        }
        
        with open(settings.BM25_INDEX_PATH, 'wb') as f:
            pickle.dump(data, f)
        
        logger.info(f"Saved BM25 index with {len(self.chunk_ids)} documents")
    
    def add_documents(self, texts: List[str], chunk_ids: List[int]):
        if len(texts) != len(chunk_ids):
            raise ValueError("Number of texts must match number of chunk_ids")
        
        for text, chunk_id in zip(texts, chunk_ids):
            tokenized = self._tokenize(text)
            self.corpus.append(tokenized)
            self.chunk_ids.append(chunk_id)
        
        if self.corpus:
            self.bm25 = BM25Okapi(self.corpus)
        
        self._save_index()
        
        logger.info(f"Added {len(texts)} documents to BM25 index")
    
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        self._maybe_reload_index()
        if not self.bm25 or not self.chunk_ids:
            logger.warning("BM25 index is empty")
            return []
        
        tokenized_query = self._tokenize(query)
        
        scores = self.bm25.get_scores(tokenized_query)
        
        top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]
        
        results = []
        for idx in top_indices:
            if scores[idx] > 0:
                results.append({
                    'chunk_id': self.chunk_ids[idx],
                    'score': float(scores[idx])
                })
        
        return results
    
    def get_total_documents(self) -> int:
        self._maybe_reload_index()
        return len(self.chunk_ids)
    
    def rebuild_index(self, texts: List[str], chunk_ids: List[int]):
        logger.info(f"Rebuilding BM25 index with {len(texts)} documents")
        
        self._initialize_empty()
        
        if texts and chunk_ids:
            self.add_documents(texts, chunk_ids)


_bm25_index_instance = None


def get_bm25_index() -> BM25Index:
    global _bm25_index_instance
    
    if _bm25_index_instance is None:
        _bm25_index_instance = BM25Index()
    
    return _bm25_index_instance
