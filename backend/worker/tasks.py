import os
from datetime import datetime
from worker.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.user import User  # noqa: F401
from app.models.document import Document
from app.models.chunk import Chunk
from app.utils.chunking import chunk_text
from app.services.embedding_provider import get_embedding_provider
from app.services.vector_store import get_vector_store
from app.utils.bm25 import get_bm25_index
import pdfplumber
import markdown
import chardet
import re
import hashlib
import logging

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def process_document_task(self, document_id: int):
    db = SessionLocal()
    
    try:
        logger.info(f"Starting ingestion task for document {document_id}")
        
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            logger.error(f"Document {document_id} not found")
            return {"status": "error", "message": "Document not found"}
        
        if document.status == "completed" and document.content_hash:
            logger.info(f"Document {document_id} already processed, checking for changes")
            
            text = extract_text(document.file_path, document.mime_type)
            content_hash = calculate_content_hash(text)
            
            if document.content_hash == content_hash:
                logger.info(f"Document {document_id} content unchanged, skipping reprocessing")
                return {"status": "success", "message": "Already processed, no changes detected"}
            else:
                logger.info(f"Document {document_id} content changed, reindexing")
        
        document.status = "processing"
        db.commit()
        
        logger.info(f"Extracting text from {document.mime_type} document {document_id}")
        text = extract_text(document.file_path, document.mime_type)
        
        if not text or len(text.strip()) < 10:
            document.status = "failed"
            document.error_message = f"No text could be extracted from {document.mime_type}"
            db.commit()
            logger.error(f"No text extracted from document {document_id}")
            return {"status": "error", "message": "No text extracted"}
        
        content_hash = calculate_content_hash(text)
        document.content_hash = content_hash
        db.commit()
        
        logger.info(f"Chunking text for document {document_id}")
        chunks = chunk_text(text)
        
        logger.info(f"Created {len(chunks)} chunks for document {document_id}")
        
        existing_chunks = db.query(Chunk).filter(Chunk.document_id == document_id).all()
        if existing_chunks:
            logger.info(f"Removing {len(existing_chunks)} existing chunks for document {document_id}")
            for chunk in existing_chunks:
                db.delete(chunk)
            db.commit()
        
        chunk_records = []
        for chunk_data in chunks:
            chunk_hash = calculate_chunk_hash(chunk_data['content'])
            
            chunk_record = Chunk(
                document_id=document.id,
                chunk_index=chunk_data['chunk_index'],
                content=chunk_data['content'],
                content_hash=chunk_hash,
                start_char=chunk_data['start_char'],
                end_char=chunk_data['end_char']
            )
            db.add(chunk_record)
            chunk_records.append(chunk_record)
        
        db.commit()
        
        for chunk_record in chunk_records:
            db.refresh(chunk_record)
        
        logger.info(f"Generating embeddings for document {document_id}")
        
        embedding_provider = get_embedding_provider()
        chunk_texts = [chunk_data['content'] for chunk_data in chunks]
        embeddings = embedding_provider.embed(chunk_texts)
        
        logger.info(f"Generated {len(embeddings)} embeddings for document {document_id}")
        
        logger.info(f"Storing vectors in FAISS for document {document_id}")
        
        vector_store = get_vector_store()
        chunk_ids = [chunk_record.id for chunk_record in chunk_records]
        vector_store.add_embeddings(embeddings, chunk_ids)
        
        logger.info(f"Adding chunks to BM25 index for document {document_id}")
        
        bm25_index = get_bm25_index()
        bm25_index.add_documents(chunk_texts, chunk_ids)
        
        logger.info(f"Updating chunk records for document {document_id}")
        
        for chunk_record in chunk_records:
            chunk_record.embedding_id = str(chunk_record.id)
        
        document.status = "completed"
        document.error_message = None
        document.indexed_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Successfully completed ingestion for document {document_id}")
        
        return {
            "status": "success",
            "document_id": document_id,
            "chunks_created": len(chunk_records)
        }
        
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}")
        
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.status = "failed"
                document.error_message = str(e)
                db.commit()
        except Exception as update_error:
            logger.error(f"Error updating document status: {update_error}")
        
        raise self.retry(exc=e, countdown=60)
        
    finally:
        db.close()


def extract_text(file_path: str, mime_type: str) -> str:
    """Extract text based on file type."""
    if mime_type == "application/pdf":
        return extract_text_from_pdf(file_path)
    elif mime_type == "text/plain":
        return extract_text_from_txt(file_path)
    elif mime_type == "text/markdown":
        return extract_text_from_markdown(file_path)
    else:
        raise ValueError(f"Unsupported mime type: {mime_type}")


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    text_parts = []
    
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    
    full_text = "\n\n".join(text_parts)
    return full_text


def extract_text_from_txt(file_path: str) -> str:
    """Extract text from plain text file with encoding detection."""
    try:
        # Try UTF-8 first
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        # Detect encoding if UTF-8 fails
        with open(file_path, 'rb') as f:
            raw_data = f.read()
            detected = chardet.detect(raw_data)
            encoding = detected['encoding'] or 'utf-8'
        
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                return f.read()
        except Exception as e:
            logger.warning(f"Failed to decode with {encoding}, falling back to utf-8 with errors='ignore'")
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()


def extract_text_from_markdown(file_path: str) -> str:
    """Extract text from markdown file, converting to plain text."""
    raw_text = extract_text_from_txt(file_path)
    
    # Convert markdown to HTML then strip tags for clean text
    html = markdown.markdown(raw_text)
    
    # Remove HTML tags
    clean_text = re.sub('<[^<]+?>', '', html)
    
    # Decode HTML entities
    clean_text = clean_text.replace('&nbsp;', ' ')
    clean_text = clean_text.replace('&lt;', '<')
    clean_text = clean_text.replace('&gt;', '>')
    clean_text = clean_text.replace('&amp;', '&')
    clean_text = clean_text.replace('&quot;', '"')
    
    # Normalize whitespace
    clean_text = re.sub(r'\n\s*\n', '\n\n', clean_text)
    clean_text = re.sub(r' +', ' ', clean_text)
    
    return clean_text.strip()


def calculate_content_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def calculate_chunk_hash(chunk_text: str) -> str:
    return hashlib.sha256(chunk_text.encode('utf-8')).hexdigest()
