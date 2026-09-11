import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./modules/Home";
import TextToEmbeddings from "./modules/TextToEmbeddings";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/embeddings" element={<TextToEmbeddings />} />
        </Routes>
      </main>
    </div>
  );
}
