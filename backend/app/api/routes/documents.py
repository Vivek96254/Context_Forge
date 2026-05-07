from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.document import Document, DocumentCreate
from app.models.user import User
from app.models.document import Document as DocumentModel
from app.core.access_control import AccessControl
from app.core.config import settings
import os
import hashlib
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])


async def get_current_user_mock() -> User:
    mock_user = User()
    mock_user.id = 1
    mock_user.email = "test@example.com"
    mock_user.username = "testuser"
    mock_user.role = "user"
    return mock_user


@router.post("/upload", response_model=Document)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_mock)
):
    # Determine file type and mime type
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    allowed_extensions = {
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.md': 'text/markdown'
    }
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only PDF, TXT, and MD files are supported. Got: {file_extension}"
        )
    
    mime_type = allowed_extensions[file_extension]
    
    try:
        file_content = await file.read()
        
        if len(file_content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file"
            )
        
        file_hash = hashlib.sha256(file_content).hexdigest()
        
        existing_doc = db.query(DocumentModel).filter(
            DocumentModel.file_hash == file_hash,
            DocumentModel.owner_id == current_user.id
        ).first()
        
        if existing_doc:
            logger.info(f"Document with hash {file_hash} already exists for user {current_user.id}")
            return existing_doc
        
        file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
        
        counter = 1
        base_name, ext = os.path.splitext(file.filename)
        while os.path.exists(file_path):
            filename = f"{base_name}_{counter}{ext}"
            file_path = os.path.join(settings.UPLOAD_DIR, filename)
            counter += 1
        
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        document = DocumentModel(
            filename=file.filename,
            file_path=file_path,
            file_hash=file_hash,
            file_size=len(file_content),
            mime_type=mime_type,
            owner_id=current_user.id,
            access_level="private",
            status="pending"
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        
        logger.info(f"User {current_user.id} uploaded {mime_type} document {document.id}, triggering background processing")
        
        from worker.tasks import process_document_task
        process_document_task.delay(document.id)
        
        return document
        
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process document"
        )


@router.get("/", response_model=List[Document])
async def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_mock),
    skip: int = 0,
    limit: int = 100
):
    all_documents = db.query(DocumentModel).offset(skip).limit(limit).all()
    
    authorized_documents = AccessControl.filter_authorized_documents(current_user, all_documents)
    
    logger.info(
        f"User {current_user.id} listed documents: "
        f"{len(authorized_documents)} authorized out of {len(all_documents)} total"
    )
    
    return authorized_documents


@router.get("/{document_id}", response_model=Document)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_mock)
):
    document = db.query(DocumentModel).filter(
        DocumentModel.id == document_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if not AccessControl.can_access_document(current_user, document):
        logger.warning(
            f"User {current_user.id} denied access to document {document_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_mock)
):
    from app.models.chunk import Chunk as ChunkModel
    
    document = db.query(DocumentModel).filter(
        DocumentModel.id == document_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if document.owner_id != current_user.id and current_user.role != "admin":
        logger.warning(
            f"User {current_user.id} denied deletion of document {document_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this document"
        )
    
    db.query(ChunkModel).filter(ChunkModel.document_id == document_id).delete()
    
    if os.path.exists(document.file_path):
        try:
            os.remove(document.file_path)
        except Exception as e:
            logger.error(f"Error deleting file {document.file_path}: {e}")
    
    db.delete(document)
    db.commit()
    
    logger.info(f"User {current_user.id} deleted document {document_id}")
    
    return {"message": "Document deleted successfully"}
