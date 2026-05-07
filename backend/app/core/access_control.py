from typing import Set
from app.models.user import User
from app.models.document import Document
import logging

logger = logging.getLogger(__name__)


class AccessControl:
    @staticmethod
    def can_access_document(user: User, document: Document) -> bool:
        if document.access_level == "public":
            return True
        
        if document.access_level == "private":
            return document.owner_id == user.id
        
        if document.access_level == "team":
            return document.owner_id == user.id or user.role == "admin"
        
        return False
    
    @staticmethod
    def filter_authorized_documents(user: User, documents: list[Document]) -> list[Document]:
        authorized = []
        
        for document in documents:
            if AccessControl.can_access_document(user, document):
                authorized.append(document)
        
        return authorized
    
    @staticmethod
    def get_authorized_document_ids(user: User, documents: list[Document]) -> Set[int]:
        authorized_ids = set()
        
        for document in documents:
            if AccessControl.can_access_document(user, document):
                authorized_ids.add(document.id)
        
        return authorized_ids
