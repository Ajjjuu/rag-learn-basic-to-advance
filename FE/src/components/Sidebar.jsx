import { useState } from "react";
import { NavLink } from "react-router-dom";

const modules = [
  { path: "/", label: "Home" },
  { path: "/embeddings", label: "Text to Embeddings" },
  // { path: "/rag", label: "RAG" },
  // { path: "/mcp", label: "MCP" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <nav
      className={`sticky top-0 flex h-screen shrink-0 flex-col bg-slate-850 text-white transition-[width,padding] duration-200 ${
        open ? "w-56 p-4" : "w-0 overflow-visible p-0"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        title={open ? "Collapse" : "Expand"}
        className="fixed top-6 z-[100] flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-100 bg-sky-300/75 text-xs font-bold text-slate-950 shadow-md backdrop-blur-sm transition-[left,background-color] duration-200 hover:bg-sky-400/90"
        style={{ left: open ? 206 : 8 }}
      >
        {open ? "«" : "»"}
      </button>

      {open && (
        <>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Modules
          </h2>
          <ul className="space-y-1">
            {modules.map((m) => (
              <li key={m.path}>
                <NavLink
                  to={m.path}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-750 hover:text-white ${
                      isActive ? "bg-slate-700 text-white" : ""
                    }`
                  }
                >
                  {m.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </>
      )}
    </nav>
  );
}
