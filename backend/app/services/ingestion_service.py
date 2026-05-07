import os
import hashlib
import pdfplumber
import markdown
import chardet
import re
from typing import BinaryIO, Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.chunk import Chunk
from app.utils.chunking import chunk_text
from app.services.embedding_provider import get_embedding_provider
from app.services.vector_store import get_vector_store
from app.utils.bm25 import get_bm25_index
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class IngestionService:
    def __init__(self, db: Session):
        self.db = db
        self.embedding_provider = get_embedding_provider()
        self.vector_store = get_vector_store()
        self.bm25_index = get_bm25_index()
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        text_parts = []
        
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        
        full_text = "\n\n".join(text_parts)
        return full_text
    
    def extract_text_from_txt(self, file_path: str) -> str:
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
    
    def extract_text_from_markdown(self, file_path: str) -> str:
        """Extract text from markdown file, converting to plain text."""
        raw_text = self.extract_text_from_txt(file_path)
        
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
    
    def extract_text(self, file_path: str, mime_type: str) -> str:
        """Extract text based on file type."""
        if mime_type == "application/pdf":
            return self.extract_text_from_pdf(file_path)
        elif mime_type == "text/plain":
            return self.extract_text_from_txt(file_path)
        elif mime_type == "text/markdown":
            return self.extract_text_from_markdown(file_path)
        else:
            raise ValueError(f"Unsupported mime type: {mime_type}")
    
    def calculate_file_hash(self, file_content: bytes) -> str:
        return hashlib.sha256(file_content).hexdigest()
    
    def calculate_content_hash(self, text: str) -> str:
        return hashlib.sha256(text.encode('utf-8')).hexdigest()
    
    def calculate_chunk_hash(self, chunk_text: str) -> str:
        return hashlib.sha256(chunk_text.encode('utf-8')).hexdigest()
    
    def save_uploaded_file(self, file_content: bytes, filename: str) -> str:
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        
        counter = 1
        base_name, ext = os.path.splitext(filename)
        while os.path.exists(file_path):
            filename = f"{base_name}_{counter}{ext}"
            file_path = os.path.join(settings.UPLOAD_DIR, filename)
            counter += 1
        
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        return file_path
    
    def process_document(
        self,
        file_content: bytes,
        filename: str,
        owner_id: int,
        mime_type: str = "application/pdf"
    ) -> Document:
        try:
            file_hash = self.calculate_file_hash(file_content)
            
            existing_doc = self.db.query(Document).filter(
                Document.file_hash == file_hash,
                Document.owner_id == owner_id
            ).first()
            
            if existing_doc:
                logger.info(f"Document with hash {file_hash} already exists")
                return existing_doc
            
            file_path = self.save_uploaded_file(file_content, filename)
            
            document = Document(
                filename=filename,
                file_path=file_path,
                file_hash=file_hash,
                file_size=len(file_content),
                mime_type=mime_type,
                owner_id=owner_id,
                status="processing"
            )
            self.db.add(document)
            self.db.commit()
            self.db.refresh(document)
            
            logger.info(f"Created document record: {document.id}")
            
            text = self.extract_text(file_path, mime_type)
            
            if not text or len(text.strip()) < 10:
                document.status = "failed"
                document.error_message = f"No text could be extracted from {mime_type}"
                self.db.commit()
                raise ValueError(f"No text extracted from {mime_type}")
            
            content_hash = self.calculate_content_hash(text)
            
            if document.content_hash == content_hash and document.status == "completed":
                logger.info(f"Document {document.id} content unchanged, skipping reprocessing")
                return document
            
            document.content_hash = content_hash
            self.db.commit()
            
            chunks = chunk_text(text)
            
            logger.info(f"Created {len(chunks)} chunks for document {document.id}")
            
            existing_chunks = self.db.query(Chunk).filter(
                Chunk.document_id == document.id
            ).all()
            
            if existing_chunks:
                logger.info(f"Removing {len(existing_chunks)} old chunks for document {document.id}")
                for chunk in existing_chunks:
                    self.db.delete(chunk)
                self.db.commit()
            
            chunk_records = []
            chunks_to_embed = []
            chunk_hashes = []
            
            for chunk_data in chunks:
                chunk_hash = self.calculate_chunk_hash(chunk_data['content'])
                
                chunk_record = Chunk(
                    document_id=document.id,
                    chunk_index=chunk_data['chunk_index'],
                    content=chunk_data['content'],
                    content_hash=chunk_hash,
                    start_char=chunk_data['start_char'],
                    end_char=chunk_data['end_char']
                )
                self.db.add(chunk_record)
                chunk_records.append(chunk_record)
                chunks_to_embed.append(chunk_data['content'])
                chunk_hashes.append(chunk_hash)
            
            self.db.commit()
            
            for chunk_record in chunk_records:
                self.db.refresh(chunk_record)
            
            chunk_texts = [chunk_data['content'] for chunk_data in chunks]
            embeddings = self.embedding_provider.embed(chunk_texts)
            
            logger.info(f"Generated {len(embeddings)} embeddings")
            
            chunk_ids = [chunk_record.id for chunk_record in chunk_records]
            self.vector_store.add_embeddings(embeddings, chunk_ids)
            
            self.bm25_index.add_documents(chunk_texts, chunk_ids)
            
            logger.info(f"Added {len(chunk_ids)} chunks to BM25 index")
            
            for chunk_record in chunk_records:
                chunk_record.embedding_id = str(chunk_record.id)
            
            document.status = "completed"
            document.indexed_at = datetime.utcnow()
            self.db.commit()
            
            logger.info(f"Successfully processed document {document.id}")
            
            return document
            
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            
            if 'document' in locals():
                document.status = "failed"
                document.error_message = str(e)
                self.db.commit()
            
            raise
    
    def reprocess_document(self, document_id: int) -> Document:
        document = self.db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            raise ValueError(f"Document {document_id} not found")
        
        logger.info(f"Reprocessing document {document_id}")
        
        document.status = "processing"
        self.db.commit()
        
        text = self.extract_text(document.file_path, document.mime_type)
        
        if not text or len(text.strip()) < 10:
            document.status = "failed"
            document.error_message = f"No text could be extracted from {document.mime_type}"
            self.db.commit()
            raise ValueError(f"No text extracted from {document.mime_type}")
        
        content_hash = self.calculate_content_hash(text)
        
        if document.content_hash == content_hash:
            logger.info(f"Document {document_id} content unchanged, skipping reprocessing")
            document.status = "completed"
            self.db.commit()
            return document
        
        logger.info(f"Document {document_id} content changed, reindexing")
        
        document.content_hash = content_hash
        self.db.commit()
        
        existing_chunks = self.db.query(Chunk).filter(
            Chunk.document_id == document_id
        ).all()
        
        if existing_chunks:
            logger.info(f"Removing {len(existing_chunks)} old chunks for document {document_id}")
            for chunk in existing_chunks:
                self.db.delete(chunk)
            self.db.commit()
        
        chunks = chunk_text(text)
        
        logger.info(f"Created {len(chunks)} chunks for document {document_id}")
        
        chunk_records = []
        for chunk_data in chunks:
            chunk_hash = self.calculate_chunk_hash(chunk_data['content'])
            
            chunk_record = Chunk(
                document_id=document.id,
                chunk_index=chunk_data['chunk_index'],
                content=chunk_data['content'],
                content_hash=chunk_hash,
                start_char=chunk_data['start_char'],
                end_char=chunk_data['end_char']
            )
            self.db.add(chunk_record)
            chunk_records.append(chunk_record)
        
        self.db.commit()
        
        for chunk_record in chunk_records:
            self.db.refresh(chunk_record)
        
        chunk_texts = [chunk_data['content'] for chunk_data in chunks]
        embeddings = self.embedding_provider.embed(chunk_texts)
        
        logger.info(f"Generated {len(embeddings)} embeddings")
        
        chunk_ids = [chunk_record.id for chunk_record in chunk_records]
        self.vector_store.add_embeddings(embeddings, chunk_ids)
        
        self.bm25_index.add_documents(chunk_texts, chunk_ids)
        
        for chunk_record in chunk_records:
            chunk_record.embedding_id = str(chunk_record.id)
        
        document.status = "completed"
        document.indexed_at = datetime.utcnow()
        self.db.commit()
        
        logger.info(f"Successfully reprocessed document {document_id}")
        
        return document
