import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Home() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    api
      .get("/health")
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("backend not reachable"));
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">Learning by Doing</h1>
      <p className="mt-2 text-slate-600">
        Pick a module from the sidebar. Add new ones as you learn.
      </p>
      <div className="mt-6 space-y-2 text-sm">
        <p>
          Backend URL: <code>{api.baseUrl}</code>
        </p>
        <p>
          Backend health: <span className="font-semibold text-slate-800">{status}</span>
        </p>
      </div>
    </div>
  );
}
