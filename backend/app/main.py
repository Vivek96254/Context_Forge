from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.api.routes import documents, query, metrics

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Enterprise Knowledge Assistant",
    description="Production-grade RAG system with RBAC and hybrid retrieval",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(query.router)
app.include_router(metrics.router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "rag-backend",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    return {
        "message": "Enterprise Knowledge Assistant API",
        "docs": "/docs",
        "health": "/health",
        "metrics": "/metrics"
    }
