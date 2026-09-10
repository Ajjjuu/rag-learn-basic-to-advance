"""Embeddings service - Business logic for converting text to embeddings."""

from uuid import uuid4

from google import genai
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, PointIdsList, PointStruct, VectorParams

from app.core.config import settings

# Initialize Gemini API client
client = genai.Client(api_key=settings.gemini_api_key)

# Qdrant settings (running locally at -p 6333:6333)
qdrant_client = QdrantClient(host="localhost", port=6333)
COLLECTION_NAME = "gemini_embeddings_3072"
VECTOR_SIZE = 3072


# ---------------------------------------------------------------------------
# Qdrant collection utilities
# ---------------------------------------------------------------------------

# Ensure the destination collection exists before any read/write operations.
def _ensure_collection() -> None:
    """Create the Qdrant collection if it does not exist."""
    if qdrant_client.collection_exists(COLLECTION_NAME):
        return

    qdrant_client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )


# Normalize Qdrant vector shape to list[float] for consistent API responses.
def _normalize_vector(raw_vector: object) -> list[float]:
    """Normalize vector response to a simple list[float]."""
    if isinstance(raw_vector, dict):
        vector = next(iter(raw_vector.values()), [])
        return [float(v) for v in vector]
    if raw_vector is None:
        return []
    return [float(v) for v in raw_vector]


# ---------------------------------------------------------------------------
# Gemini Embedding API
# ---------------------------------------------------------------------------

# Call Gemini embedding model and return the raw embedding vector.
def get_embeddings(text: str) -> list[float]:
    """
    Convert text to embeddings using Google Gemini API.
    
    Args:
        text: The input text to convert to embeddings
        
    Returns:
        List of floats representing the embedding vector
    """
    result = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text,
    )
    return result.embeddings[0].values


# ---------------------------------------------------------------------------
# Combined workflow API (Gemini -> Qdrant)
# ---------------------------------------------------------------------------

# Generate embedding, store in Qdrant, then query Qdrant and return both outputs.
def store_and_query_embeddings(text: str) -> tuple[str, list[float], list[float], str, float]:
    """Store Gemini embeddings and return both model output and Qdrant query output."""
    _ensure_collection()

    embeddings = get_embeddings(text)
    point_id = str(uuid4())

    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=point_id,
                vector=embeddings,
                payload={"text": text},
            )
        ],
        wait=True,
    )

    query_result = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=embeddings,
        limit=1,
        with_vectors=True,
        with_payload=False,
    )

    points = getattr(query_result, "points", None) or []
    if not points:
        raise RuntimeError("Failed to query stored embedding from Qdrant.")

    queried_point = points[0]
    queried_vector = _normalize_vector(queried_point.vector)
    queried_id = str(queried_point.id)
    queried_score = float(queried_point.score)
    return point_id, embeddings, queried_vector, queried_id, queried_score


# ---------------------------------------------------------------------------
# Qdrant management APIs (count, list, delete)
# ---------------------------------------------------------------------------

# Return exact number of vectors stored in the configured collection.
def count_stored_embeddings() -> int:
    """Return total number of vectors currently stored in the collection."""
    _ensure_collection()
    count_result = qdrant_client.count(collection_name=COLLECTION_NAME, exact=True)
    return int(count_result.count)


# List recent stored points with id and optional source text payload.
def list_stored_embeddings(limit: int = 20) -> list[dict[str, str | None]]:
    """Return stored vector IDs with optional source text from payload."""
    _ensure_collection()
    records, _ = qdrant_client.scroll(
        collection_name=COLLECTION_NAME,
        limit=limit,
        with_payload=True,
        with_vectors=False,
    )

    items: list[dict[str, str | None]] = []
    for record in records:
        payload = record.payload or {}
        items.append(
            {
                "point_id": str(record.id),
                "text": str(payload.get("text")) if payload.get("text") is not None else None,
            }
        )

    return items


# Delete one stored vector by point id. Returns False if id was not found.
def delete_stored_embedding(point_id: str) -> bool:
    """Delete a vector by point ID from Qdrant collection."""
    _ensure_collection()

    existing = qdrant_client.retrieve(
        collection_name=COLLECTION_NAME,
        ids=[point_id],
        with_payload=False,
        with_vectors=False,
    )
    if not existing:
        return False

    qdrant_client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=PointIdsList(points=[point_id]),
        wait=True,
    )
    return True


# ---------------------------------------------------------------------------
# Semantic retrieval + LLM reasoning APIs
# ---------------------------------------------------------------------------

# Query nearest neighbors from Qdrant using embedding similarity and payload text.

# vector DB stores relative info also while converting. 
# Qdrant point
# │
# ├── vector
# │    └── [1536 numbers]
# │
# └── payload
#      ├── original chunk text
#      ├── document name
#      ├── page number
#      └── other metadata
#Example:
# {
#   "id": 123,
#   "vector": [0.13, -0.42, "..."],
#   "payload": {
#     "text": "The company revenue increased by 20%",
#     "page": 42
#   }
# }

def find_similar_vectors(text: str, top_k: int = 1) -> list[dict[str, str | float | None]]:
    _ensure_collection()

    query_vector = get_embeddings(text)
    query_result = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
        with_vectors=False,
        with_payload=True,
    )

    points = getattr(query_result, "points", None) or []
    matches: list[dict[str, str | float | None]] = []
    for point in points:
        payload = point.payload or {}
        matches.append(
            {
                "point_id": str(point.id),
                "score": float(point.score),
                "text": str(payload.get("text")) if payload.get("text") is not None else None,
            }
        )

    return matches


# Query nearest neighbors from Qdrant and return their stored texts as related items.
def generate_related_words(query_text: str, top_k: int = 1) -> dict[str, object]:
    """Find semantically similar items from Qdrant storage."""
    matches = find_similar_vectors(query_text, top_k=top_k)
    
    # Extract just the text from matches as related words
    related_words = [
        match["text"] 
        for match in matches 
        if match["text"] is not None
    ]

    return {
        "query_text": query_text,
        "top_k": top_k,
        "related_words": related_words,
        "matches": matches,
    }

# learn about model evaluation concepts: Accuracy, Precision, Recall, F1-Score, ROC-AUC, and RMSE?
# Accuracy, Precision, Recall, F1-Score, ROC-AUC, and RMSE?