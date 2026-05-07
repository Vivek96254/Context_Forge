import os
import json
import numpy as np
import faiss
from typing import List, Dict, Any, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class VectorStore:
    def __init__(self):
        self.index: Optional[faiss.Index] = None
        self.dimension: int = 1536
        self.id_to_chunk_id: Dict[int, int] = {}
        self.next_id: int = 0
        self._faiss_index_mtime: Optional[float] = None
        self._faiss_mapping_mtime: Optional[float] = None
        
        self._initialize_index()
        self._load_index()
    
    def _initialize_index(self):
        self.index = faiss.IndexFlatL2(self.dimension)
        logger.info(f"Initialized FAISS index with dimension {self.dimension}")
    
    def _load_index(self):
        if os.path.exists(settings.FAISS_INDEX_PATH) and os.path.exists(settings.FAISS_MAPPING_PATH):
            try:
                self.index = faiss.read_index(settings.FAISS_INDEX_PATH)
                
                with open(settings.FAISS_MAPPING_PATH, 'r') as f:
                    mapping_data = json.load(f)
                    self.id_to_chunk_id = {int(k): v for k, v in mapping_data['id_to_chunk_id'].items()}
                    self.next_id = mapping_data['next_id']
                
                self._faiss_index_mtime = os.path.getmtime(settings.FAISS_INDEX_PATH)
                self._faiss_mapping_mtime = os.path.getmtime(settings.FAISS_MAPPING_PATH)
                
                logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors")
            except Exception as e:
                logger.error(f"Error loading FAISS index: {e}")
                self._initialize_index()
        else:
            logger.info("No existing FAISS index found, starting fresh")
            self._faiss_index_mtime = None
            self._faiss_mapping_mtime = None

    def _maybe_reload_index(self):
        """
        The ingestion worker updates FAISS index files on disk, but this
        API process keeps a singleton VectorStore in memory. To avoid stale
        retrieval results, reload when index/mapping files change.
        """
        try:
            if not (os.path.exists(settings.FAISS_INDEX_PATH) and os.path.exists(settings.FAISS_MAPPING_PATH)):
                return
            
            index_mtime = os.path.getmtime(settings.FAISS_INDEX_PATH)
            mapping_mtime = os.path.getmtime(settings.FAISS_MAPPING_PATH)
            
            if self._faiss_index_mtime is None or self._faiss_mapping_mtime is None:
                self._load_index()
                return
            
            if index_mtime != self._faiss_index_mtime or mapping_mtime != self._faiss_mapping_mtime:
                logger.info("FAISS index changed on disk, reloading")
                self._load_index()
        except Exception as e:
            logger.warning(f"Failed to auto-reload FAISS index: {e}")
    
    def _save_index(self):
        os.makedirs(os.path.dirname(settings.FAISS_INDEX_PATH), exist_ok=True)
        
        faiss.write_index(self.index, settings.FAISS_INDEX_PATH)
        
        mapping_data = {
            'id_to_chunk_id': self.id_to_chunk_id,
            'next_id': self.next_id
        }
        
        with open(settings.FAISS_MAPPING_PATH, 'w') as f:
            json.dump(mapping_data, f)
        
        logger.info(f"Saved FAISS index with {self.index.ntotal} vectors")
    
    def add_embeddings(self, embeddings: List[List[float]], chunk_ids: List[int]):
        if len(embeddings) != len(chunk_ids):
            raise ValueError("Number of embeddings must match number of chunk_ids")
        
        embeddings_array = np.array(embeddings, dtype=np.float32)
        
        self.index.add(embeddings_array)
        
        for chunk_id in chunk_ids:
            self.id_to_chunk_id[self.next_id] = chunk_id
            self.next_id += 1
        
        self._save_index()
        
        logger.info(f"Added {len(embeddings)} embeddings to FAISS index")
    
    def search(self, query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        self._maybe_reload_index()
        query_array = np.array([query_embedding], dtype=np.float32)
        
        distances, indices = self.index.search(query_array, top_k)
        
        results = []
        for idx, (distance, faiss_id) in enumerate(zip(distances[0], indices[0])):
            if faiss_id == -1:
                continue
            
            chunk_id = self.id_to_chunk_id.get(int(faiss_id))
            if chunk_id is not None:
                results.append({
                    'chunk_id': chunk_id,
                    'distance': float(distance),
                    'score': 1 / (1 + float(distance))
                })
        
        return results
    
    def get_total_vectors(self) -> int:
        self._maybe_reload_index()
        return self.index.ntotal


_vector_store_instance = None


def get_vector_store() -> VectorStore:
    global _vector_store_instance
    
    if _vector_store_instance is None:
        _vector_store_instance = VectorStore()
    
    return _vector_store_instance
