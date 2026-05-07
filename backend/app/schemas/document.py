from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DocumentBase(BaseModel):
    filename: str


class DocumentCreate(DocumentBase):
    access_level: Optional[str] = "private"


class DocumentUpdate(BaseModel):
    status: Optional[str] = None
    error_message: Optional[str] = None
    indexed_at: Optional[datetime] = None
    access_level: Optional[str] = None
    content_hash: Optional[str] = None


class DocumentInDB(DocumentBase):
    id: int
    file_path: str
    file_hash: str
    content_hash: Optional[str]
    file_size: int
    mime_type: str
    owner_id: int
    access_level: str
    status: str
    error_message: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    indexed_at: Optional[datetime]

    class Config:
        from_attributes = True


class Document(DocumentInDB):
    pass
