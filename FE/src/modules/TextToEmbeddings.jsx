import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function TextToEmbeddings() {
  const [inputText, setInputText] = useState("");
  const [embeddingResult, setEmbeddingResult] = useState(null);
  const [storedCount, setStoredCount] = useState(null);
  const [storedItems, setStoredItems] = useState([]);
  const [relatedResult, setRelatedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storageLoading, setStorageLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const refreshStoredVectors = async () => {
    const response = await api.get("/embeddings/stored?limit=20");
    setStoredCount(response.total);
    setStoredItems(response.items || []);
  };

  useEffect(() => {
    const loadInitialStoredData = async () => {
      setStorageLoading(true);
      try {
        await refreshStoredVectors();
      } catch (err) {
        setError(err.message || "Failed to load stored vectors");
      } finally {
        setStorageLoading(false);
      }
    };

    loadInitialStoredData();
  }, []);

  const handleConvert = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text");
      return;
    }

    setLoading(true);
    setError(null);
    setEmbeddingResult(null);

    try {
      const response = await api.post("/embeddings", { text: inputText });
      setEmbeddingResult(response);
      await refreshStoredVectors();
    } catch (err) {
      setError(err.message || "Failed to convert text to embeddings");
    } finally {
      setLoading(false);
    }
  };

  const handleFindRelatedWords = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text");
      return;
    }

    setRelatedLoading(true);
    setError(null);
    setRelatedResult(null);

    try {
      const response = await api.post("/embeddings/related-words", {
        text: inputText,
        top_k: 1,
      });
      setRelatedResult(response);
    } catch (err) {
      setError(err.message || "Failed to find related words");
    } finally {
      setRelatedLoading(false);
    }
  };

  const loadStoredCount = async () => {
    setStorageLoading(true);
    setError(null);
    try {
      const response = await api.get("/embeddings/count");
      setStoredCount(response.total);
    } catch (err) {
      setError(err.message || "Failed to load stored vector count");
    } finally {
      setStorageLoading(false);
    }
  };

  const loadStoredVectors = async () => {
    setStorageLoading(true);
    setError(null);
    try {
      await refreshStoredVectors();
    } catch (err) {
      setError(err.message || "Failed to load stored vectors");
    } finally {
      setStorageLoading(false);
    }
  };

  const handleDeleteVector = async (pointId) => {
    setDeletingId(pointId);
    setError(null);
    try {
      await api.delete(`/embeddings/${pointId}`);
      await refreshStoredVectors();
    } catch (err) {
      setError(err.message || "Failed to delete stored vector");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="module-container module-wide">
      <div className="module-hero">
        <h1>Text to Embeddings</h1>
        <p>Save embeddings to Qdrant, inspect stored vectors, and generate related words with Groq.</p>
      </div>

      <section className="workspace-panel">
        <div className="workspace-input">
          <label htmlFor="input-text">Text Input</label>
          <textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text here..."
            rows={8}
            className="text-input"
          />
        </div>

        <div className="workspace-actions">
          <div className="action-group">
            <h3>Generate</h3>
            <button
              onClick={handleConvert}
              disabled={loading}
              className="convert-button primary-button block-button"
            >
              {loading ? "Saving..." : "Convert & Save"}
            </button>
            <p className="action-help">
              Generates the embedding, stores it in Qdrant, and shows the saved vector plus the Qdrant match.
            </p>
          </div>

          <div className="action-group">
            <h3>Semantic search</h3>
            <button
              onClick={handleFindRelatedWords}
              disabled={relatedLoading}
              className="convert-button secondary-button block-button"
            >
              {relatedLoading ? "Finding..." : "Find Related Words"}
            </button>
            <p className="action-help">
              Find semantically similar items already stored in Qdrant based on vector similarity.
            </p>
          </div>

          <div className="action-group">
            <h3>Stored vectors</h3>
            <div className="button-row">
              <button onClick={loadStoredCount} disabled={storageLoading} className="convert-button secondary-button">
                {storageLoading ? "Loading..." : "Get Stored Count"}
              </button>
              <button onClick={loadStoredVectors} disabled={storageLoading} className="convert-button secondary-button">
                {storageLoading ? "Loading..." : "List Stored Vectors"}
              </button>
            </div>
            <p className="action-help">
              Check how many vectors are stored or load the latest stored IDs.
            </p>
          </div>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      <section className="results-area">
        {embeddingResult && (
          <div className="result-card">
            <h2>Embeddings Result</h2>
            <div className="embeddings-info">
              <p>
                <strong>Point ID:</strong> {embeddingResult.point_id}
              </p>
              <p>
                <strong>Dimension:</strong> {embeddingResult.dimensions}
              </p>
              <p>
                <strong>Qdrant Match ID:</strong> {embeddingResult.qdrant_match_id}
              </p>
              <p>
                <strong>Qdrant Score:</strong> {embeddingResult.qdrant_score}
              </p>
            </div>

            <h3>Embedding Model Output (first 5)</h3>
            <code>{JSON.stringify(embeddingResult.model_embeddings.slice(0, 5))}</code>

            <h3>Qdrant Queried Output (first 5)</h3>
            <code>{JSON.stringify(embeddingResult.qdrant_embeddings.slice(0, 5))}</code>

            <details>
              <summary>View full embedding model output</summary>
              <pre>{JSON.stringify(embeddingResult.model_embeddings, null, 2)}</pre>
            </details>
            <details>
              <summary>View full Qdrant queried output</summary>
              <pre>{JSON.stringify(embeddingResult.qdrant_embeddings, null, 2)}</pre>
            </details>
          </div>
        )}

        {relatedResult && (
          <div className="result-card">
            <h2>Related Items from Qdrant</h2>
            <p>
              <strong>Top K:</strong> {relatedResult.top_k}
            </p>

            <h3>Related Texts</h3>
            {relatedResult.related_words?.length ? (
              <ul>
                {relatedResult.related_words.map((word, index) => (
                  <li key={`${word}-${index}`}>{word}</li>
                ))}
              </ul>
            ) : (
              <p>No related items found in Qdrant.</p>
            )}
            <h3>Similarity Scores</h3>
            {relatedResult.matches?.length ? (
              <ul>
                {relatedResult.matches.map((match) => (
                  <li key={match.point_id}>
                    <strong>ID:</strong> {match.point_id} | <strong>Score:</strong> {match.score.toFixed(4)}
                    {match.text ? (
                      <>
                        {" "}
                        | <strong>Text:</strong> {match.text}
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No matches found in Qdrant.</p>
            )}
          </div>
        )}

        {(storedCount !== null || storedItems.length > 0) && (
          <div className="result-card">
            <h2>Qdrant Stored Data</h2>
            {storedCount !== null && (
              <p>
                <strong>Total Stored Vectors:</strong> {storedCount}
              </p>
            )}

            {storedItems.length > 0 && (
              <>
                <h3>Recent Stored Items</h3>
                <ul>
                  {storedItems.map((item) => (
                    <li key={item.point_id}>
                      <strong>ID:</strong> {item.point_id}
                      {item.text ? (
                        <>
                          {" "}
                          | <strong>Text:</strong> {item.text}
                        </>
                      ) : null}
                      {" "}
                      <button
                        onClick={() => handleDeleteVector(item.point_id)}
                        disabled={deletingId === item.point_id}
                        className="convert-button"
                        style={{ marginLeft: "0.5rem" }}
                      >
                        {deletingId === item.point_id ? "Deleting..." : "Delete"}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
