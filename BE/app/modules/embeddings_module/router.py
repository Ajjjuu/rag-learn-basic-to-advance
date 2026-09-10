"""Embeddings module - Routes for text to embeddings conversion."""

from fastapi import APIRouter, HTTPException, Query

from app.modules.embeddings_module.schemas import (
    DeleteVectorResponse,
    EmbeddingsResponse,
    RelatedWordsResponse,
    SimilarityQueryInput,
    StoredVectorsCountResponse,
    StoredVectorsResponse,
    TextInput,
)
from app.modules.embeddings_module.service import (
    COLLECTION_NAME,
    count_stored_embeddings,
    delete_stored_embedding,
    generate_related_words,
    list_stored_embeddings,
    store_and_query_embeddings,
)

router = APIRouter(tags=["embeddings"])


@router.post("/embeddings", response_model=EmbeddingsResponse)
def convert_to_embeddings(input_data: TextInput):
    """
    Convert text to embeddings using Google Gemini API.
    """
    point_id, model_embeddings, qdrant_embeddings, qdrant_match_id, qdrant_score = store_and_query_embeddings(
        input_data.text
    )
    return EmbeddingsResponse(
        point_id=point_id,
        model_embeddings=model_embeddings,
        qdrant_embeddings=qdrant_embeddings,
        qdrant_match_id=qdrant_match_id,
        qdrant_score=qdrant_score,
        dimensions=len(model_embeddings),
    )


@router.get("/embeddings/count", response_model=StoredVectorsCountResponse)
def get_embeddings_count():
    """Return how many vectors are currently stored in Qdrant."""
    total = count_stored_embeddings()
    return StoredVectorsCountResponse(collection_name=COLLECTION_NAME, total=total)


@router.get("/embeddings/stored", response_model=StoredVectorsResponse)
def get_stored_embeddings(limit: int = Query(default=20, ge=1, le=200)):
    """List stored vectors from Qdrant with their unique IDs."""
    items = list_stored_embeddings(limit=limit)
    total = count_stored_embeddings()
    return StoredVectorsResponse(
        collection_name=COLLECTION_NAME,
        total=total,
        returned=len(items),
        items=items,
    )


@router.delete("/embeddings/{point_id}", response_model=DeleteVectorResponse)
def delete_embedding(point_id: str):
    """Delete a stored embedding by its unique point ID."""
    deleted = delete_stored_embedding(point_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Point not found: {point_id}")

    total = count_stored_embeddings()
    return DeleteVectorResponse(point_id=point_id, deleted=True, total=total)


@router.post("/embeddings/related-words", response_model=RelatedWordsResponse)
def get_related_words(input_data: SimilarityQueryInput):
    """Find nearest vectors in Qdrant and generate related words using Groq model."""
    if not input_data.text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    top_k = min(max(input_data.top_k, 1), 20)
    result = generate_related_words(query_text=input_data.text, top_k=top_k)
    return RelatedWordsResponse(**result)
