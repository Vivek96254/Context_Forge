import tiktoken
from typing import List, Dict, Any
from app.core.config import settings


def count_tokens(text: str, encoding_name: str = "cl100k_base") -> int:
    encoding = tiktoken.get_encoding(encoding_name)
    return len(encoding.encode(text))


def chunk_text(text: str, chunk_size: int = None, chunk_overlap: int = None) -> List[Dict[str, Any]]:
    if chunk_size is None:
        chunk_size = settings.CHUNK_SIZE
    if chunk_overlap is None:
        chunk_overlap = settings.CHUNK_OVERLAP
    
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)
    
    chunks = []
    start_idx = 0
    chunk_index = 0
    
    while start_idx < len(tokens):
        end_idx = start_idx + chunk_size
        chunk_tokens = tokens[start_idx:end_idx]
        
        chunk_text = encoding.decode(chunk_tokens)
        
        char_start = len(encoding.decode(tokens[:start_idx]))
        char_end = len(encoding.decode(tokens[:end_idx]))
        
        chunks.append({
            "content": chunk_text,
            "chunk_index": chunk_index,
            "start_char": char_start,
            "end_char": char_end,
            "token_count": len(chunk_tokens)
        })
        
        chunk_index += 1
        start_idx = end_idx - chunk_overlap
        
        if end_idx >= len(tokens):
            break
    
    return chunks
