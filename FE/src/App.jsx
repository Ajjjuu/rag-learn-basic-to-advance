import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./modules/Home";
import TextToEmbeddings from "./modules/TextToEmbeddings";

/**
 * App shell: sidebar on the left, routed module content on the right.
 * Add a <Route> here for each new module (and a link in Sidebar.jsx).
 */
export default function App() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/embeddings" element={<TextToEmbeddings />} />
          {/* <Route path="/rag" element={<Rag />} /> */}
        </Routes>
      </main>
    </div>
  );
}
