from abc import ABC, abstractmethod
from typing import List
from app.core.config import settings
import hashlib
import numpy as np


class EmbeddingProvider(ABC):
    @abstractmethod
    def embed(self, texts: List[str]) -> List[List[float]]:
        pass


class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not set in environment")
        
        from openai import OpenAI
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.EMBEDDING_MODEL
    
    def embed(self, texts: List[str]) -> List[List[float]]:
        texts = [text.replace("\n", " ") for text in texts]
        
        response = self.client.embeddings.create(
            input=texts,
            model=self.model
        )
        
        embeddings = [item.embedding for item in response.data]
        return embeddings


class LocalHashEmbeddingProvider(EmbeddingProvider):
    """
    Offline embedding provider for development/demo environments.
    Produces deterministic 1536-dim vectors from text (no external API calls).
    """

    def __init__(self, dimension: int = 1536):
        self.dimension = dimension

    def _seed_for_text(self, text: str) -> int:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        # use first 8 bytes as a stable 64-bit seed
        return int.from_bytes(digest[:8], "big", signed=False)

    def embed(self, texts: List[str]) -> List[List[float]]:
        vectors: List[List[float]] = []
        for t in texts:
            seed = self._seed_for_text(t)
            rng = np.random.default_rng(seed)
            v = rng.standard_normal(self.dimension, dtype=np.float32)
            # L2 normalize to make cosine-ish comparisons more stable under L2
            norm = np.linalg.norm(v)
            if norm > 0:
                v = v / norm
            vectors.append(v.astype(np.float32).tolist())
        return vectors


_embedding_provider_instance = None


def get_embedding_provider() -> EmbeddingProvider:
    global _embedding_provider_instance
    
    if _embedding_provider_instance is not None:
        return _embedding_provider_instance
    
    provider_name = (settings.LLM_PROVIDER or "openai").lower()
    openai_key = (settings.OPENAI_API_KEY or "").strip()
    openai_key_is_placeholder = (openai_key == "sk-placeholder") or ("placeholder" in openai_key.lower())
    # Cerebras is used for LLM responses; it does not provide embeddings in this project.
    # If OpenAI key isn't configured, fall back to local embeddings so ingestion/retrieval work.
    if provider_name == "cerebras" and (not openai_key or openai_key_is_placeholder):
        _embedding_provider_instance = LocalHashEmbeddingProvider(dimension=1536)
    else:
        _embedding_provider_instance = OpenAIEmbeddingProvider()
    return _embedding_provider_instance
