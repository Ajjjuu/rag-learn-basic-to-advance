import { NavLink } from "react-router-dom";

/**
 * Side navigation. Add a new entry here for each learning module,
 * then add a matching <Route> in App.jsx.
 */
const modules = [
  { path: "/", label: "Home" },
  { path: "/embeddings", label: "Text to Embeddings" },
  // { path: "/rag", label: "RAG" },
  // { path: "/mcp", label: "MCP" },
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <h2 className="sidebar-title">Modules</h2>
      <ul className="sidebar-list">
        {modules.map((m) => (
          <li key={m.path}>
            <NavLink
              to={m.path}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {m.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
