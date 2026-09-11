"""Embeddings module - Pydantic schemas for requests and responses."""

from pydantic import BaseModel


class TextInput(BaseModel):
    text: str


class EmbeddingsResponse(BaseModel):
    point_id: str
    model_embeddings: list[float]
    qdrant_embeddings: list[float]
    qdrant_match_id: str
    qdrant_score: float
    dimensions: int


class StoredVectorItem(BaseModel):
    point_id: str
    text: str | None = None


class StoredVectorsResponse(BaseModel):
    collection_name: str
    total: int
    returned: int
    items: list[StoredVectorItem]


class StoredVectorsCountResponse(BaseModel):
    collection_name: str
    total: int


class DeleteVectorResponse(BaseModel):
    point_id: str
    deleted: bool
    total: int


class SimilarityQueryInput(BaseModel):
    text: str
    top_k: int = 1


class SimilarMatchItem(BaseModel):
    point_id: str
    score: float
    text: str | None = None


class RelatedWordsResponse(BaseModel):
    query_text: str
    top_k: int
    related_words: list[str]
    matches: list[SimilarMatchItem]


class FindAnswerResponse(BaseModel):
    query_text: str
    top_k: int
    answer: str
    context_items: list[str]
    matches: list[SimilarMatchItem]
