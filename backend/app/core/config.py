import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    REDIS_URL: str = Field(..., env="REDIS_URL")
    
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    LLM_PROVIDER: str = Field(default="openai", env="LLM_PROVIDER")
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    CEREBRAS_API_KEY: Optional[str] = Field(default=None, env="CEREBRAS_API_KEY")
    
    EMBEDDING_MODEL: str = Field(default="text-embedding-3-small", env="EMBEDDING_MODEL")
    LLM_MODEL: str = Field(default="gpt-4-turbo-preview", env="LLM_MODEL")
    
    CHUNK_SIZE: int = Field(default=800, env="CHUNK_SIZE")
    CHUNK_OVERLAP: int = Field(default=100, env="CHUNK_OVERLAP")
    
    TOP_K: int = Field(default=5, env="TOP_K")
    MAX_CONTEXT_TOKENS: int = Field(default=4000, env="MAX_CONTEXT_TOKENS")
    
    HYBRID_ALPHA: float = Field(default=0.7, env="HYBRID_ALPHA")
    ENABLE_QUERY_REWRITING: bool = Field(default=True, env="ENABLE_QUERY_REWRITING")
    
    VECTOR_STORE_PATH: str = Field(default="./data/faiss_index", env="VECTOR_STORE_PATH")
    UPLOAD_DIR: str = Field(default="./data/uploads", env="UPLOAD_DIR")
    FAISS_INDEX_PATH: str = Field(default="./data/faiss_index/index.faiss", env="FAISS_INDEX_PATH")
    FAISS_MAPPING_PATH: str = Field(default="./data/faiss_index/mapping.json", env="FAISS_MAPPING_PATH")
    BM25_INDEX_PATH: str = Field(default="./data/faiss_index/bm25_index.pkl", env="BM25_INDEX_PATH")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

os.makedirs(settings.VECTOR_STORE_PATH, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
