import { useEffect, useState } from "react";
import { api } from "../api/client";

/**
 * Home page. Also checks the backend /health endpoint so you can
 * confirm FE and BE are talking to each other.
 */
export default function Home() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    api
      .get("/health")
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("backend not reachable"));
  }, []);

  return (
    <div>
      <h1>Learning by Doing</h1>
      <p>Pick a module from the sidebar. Add new ones as you learn.</p>
      <p>
        Backend URL: <code>{api.baseUrl}</code>
      </p>
      <p>
        Backend health: <strong>{status}</strong>
      </p>
    </div>
  );
}
