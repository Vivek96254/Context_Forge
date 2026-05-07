from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.core.config import settings


class LLMProvider(ABC):
    @abstractmethod
    def generate_response(self, messages: List[Dict[str, str]]) -> str:
        pass


class OpenAIProvider(LLMProvider):
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not set in environment")
        
        from openai import OpenAI
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.LLM_MODEL
    
    def generate_response(self, messages: List[Dict[str, str]]) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.2,
            max_tokens=1024
        )
        return response.choices[0].message.content


class CerebrasProvider(LLMProvider):
    def __init__(self):
        if not settings.CEREBRAS_API_KEY:
            raise ValueError("CEREBRAS_API_KEY not set in environment")
        
        from cerebras.cloud.sdk import Cerebras
        self.client = Cerebras(api_key=settings.CEREBRAS_API_KEY)
        self.model = "llama3.1-8b"
    
    def generate_response(self, messages: List[Dict[str, str]]) -> str:
        response = self.client.chat.completions.create(
            messages=messages,
            model=self.model,
            # Cerebras SDK uses an OpenAI-compatible surface, but token parameter
            # naming differs across versions. `max_tokens` is the widely supported name.
            max_tokens=1024,
            temperature=0.2,
            top_p=1
        )
        return response.choices[0].message.content


_provider_instance = None


def get_llm_provider() -> LLMProvider:
    global _provider_instance
    
    if _provider_instance is not None:
        return _provider_instance
    
    provider_name = settings.LLM_PROVIDER.lower()
    
    if provider_name == "openai":
        _provider_instance = OpenAIProvider()
    elif provider_name == "cerebras":
        _provider_instance = CerebrasProvider()
    else:
        raise ValueError(f"Invalid LLM_PROVIDER: {provider_name}. Must be 'openai' or 'cerebras'")
    
    return _provider_instance
