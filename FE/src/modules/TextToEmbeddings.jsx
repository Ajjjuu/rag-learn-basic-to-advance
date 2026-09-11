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
    <div className="w-full">
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-slate-900">Text to Embeddings</h1>
        <p className="mt-1 text-slate-600">
          Save embeddings to Qdrant, inspect stored vectors, and generate related words with Groq.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-3">
        <div className="flex h-full flex-col">
          <label htmlFor="input-text" className="mb-2 block text-sm font-semibold text-slate-800">
            Text Input
          </label>
          <textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text here..."
            rows={8}
            className="text-input min-h-[200px] flex-1"
          />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Generate
            </h3>
            <button onClick={handleConvert} disabled={loading} className="convert-button block-button">
              {loading ? "Saving..." : "Convert & Save"}
            </button>
            <p className="mt-2 text-xs text-slate-500">
              Generates the embedding, stores it in Qdrant, and shows the saved vector plus the Qdrant match.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Semantic search
            </h3>
            <button onClick={handleFindRelatedWords} disabled={relatedLoading} className="convert-button secondary-button block-button">
              {relatedLoading ? "Finding..." : "Find Related Words"}
            </button>
            <p className="mt-2 text-xs text-slate-500">
              Find semantically similar items already stored in Qdrant based on vector similarity.
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Stored vectors
          </h3>
          {storageLoading && storedCount === null ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-800">
                <span className="font-semibold">Total:</span> {storedCount ?? 0}
              </p>
              {storedItems.length > 0 ? (
                <ul className="max-h-80 list-none space-y-0 overflow-y-auto rounded-lg border border-slate-200">
                  {storedItems.map((item) => (
                    <li key={item.point_id} className="flex flex-col gap-1 border-b border-slate-200 p-3 last:border-b-0">
                      <div className="break-words text-sm text-slate-800">
                        {item.text ? item.text : <em>(no text)</em>}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="max-w-[140px] truncate font-mono text-xs text-slate-400" title={item.point_id}>
                          {item.point_id}
                        </span>
                        <button
                          onClick={() => handleDeleteVector(item.point_id)}
                          disabled={deletingId === item.point_id}
                          className="convert-button secondary-button small-button"
                        >
                          {deletingId === item.point_id ? "..." : "Delete"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No vectors stored yet.</p>
              )}
            </>
          )}
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 flex flex-col gap-6">
        {embeddingResult && (
          <div className="card">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Embeddings Result</h2>
            <div className="mb-4 rounded-lg bg-slate-50 p-4 text-sm">
              <p className="my-1">
                <strong>Point ID:</strong> {embeddingResult.point_id}
              </p>
              <p className="my-1">
                <strong>Dimension:</strong> {embeddingResult.dimensions}
              </p>
              <p className="my-1">
                <strong>Qdrant Match ID:</strong> {embeddingResult.qdrant_match_id}
              </p>
              <p className="my-1">
                <strong>Qdrant Score:</strong> {embeddingResult.qdrant_score}
              </p>
            </div>

            <h3 className="mb-2 text-sm font-semibold">Embedding Model Output (first 5)</h3>
            <code>{JSON.stringify(embeddingResult.model_embeddings.slice(0, 5))}</code>

            <h3 className="mb-2 mt-4 text-sm font-semibold">Qdrant Queried Output (first 5)</h3>
            <code>{JSON.stringify(embeddingResult.qdrant_embeddings.slice(0, 5))}</code>

            <details className="mt-4">
              <summary className="cursor-pointer rounded bg-slate-200 px-2 py-1.5 text-sm font-semibold select-none hover:bg-slate-300">
                View full embedding model output
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-xs">
                {JSON.stringify(embeddingResult.model_embeddings, null, 2)}
              </pre>
            </details>
            <details className="mt-2">
              <summary className="cursor-pointer rounded bg-slate-200 px-2 py-1.5 text-sm font-semibold select-none hover:bg-slate-300">
                View full Qdrant queried output
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-xs">
                {JSON.stringify(embeddingResult.qdrant_embeddings, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {relatedResult && (
          <div className="card">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Related Items from Qdrant</h2>
            <p className="mb-3 text-sm">
              <strong>Top K:</strong> {relatedResult.top_k}
            </p>

            <h3 className="mb-2 text-sm font-semibold">Related Texts</h3>
            {relatedResult.related_words?.length ? (
              <ul className="mb-4 list-disc space-y-1 pl-5 text-sm">
                {relatedResult.related_words.map((word, index) => (
                  <li key={`${word}-${index}`}>{word}</li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-slate-500">No related items found in Qdrant.</p>
            )}

            <h3 className="mb-2 text-sm font-semibold">Similarity Scores</h3>
            {relatedResult.matches?.length ? (
              <ul className="space-y-1 text-sm">
                {relatedResult.matches.map((match) => (
                  <li key={match.point_id}>
                    <strong>ID:</strong> {match.point_id} | <strong>Score:</strong>{" "}
                    {match.score.toFixed(4)}
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
              <p className="text-sm text-slate-500">No matches found in Qdrant.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
