# Frontend (React + Vite)

React UI for the "learn by doing" project. A sidebar routes between modules;
each thing you learn (RAG, MCP, etc.) becomes its own page under `src/modules/`.

## Runs on

- **Port `5420`** → http://localhost:5420 (set in `vite.config.js`)
- Talks to the backend at the URL in `.env` (`VITE_API_BASE_URL`, default
  `http://127.0.0.1:8420`)

## Folder structure

```
FE/
├── index.html
├── vite.config.js           # Dev server port (5420)
├── .env / .env.example      # VITE_API_BASE_URL = backend base URL
└── src/
    ├── main.jsx             # App bootstrap + router
    ├── App.jsx              # Layout + route table
    ├── index.css            # Basic styling
    ├── api/
    │   └── client.js        # fetch wrapper using VITE_API_BASE_URL
    ├── components/
    │   └── Sidebar.jsx      # Navigation between modules
    └── modules/
        └── Home.jsx         # Landing page (also pings backend /health)
```

## Setup & run

From the `FE/` folder:

```powershell
# 1. Install dependencies
npm install

# 2. Copy env file (already provided, edit if backend URL changes)
copy .env.example .env

# 3. Start the dev server
npm run dev
```

Then open http://localhost:5420. The Home page shows the backend health so you
can confirm FE ↔ BE connectivity (start the backend too — see BE/README.md).

## Adding a new module (e.g. RAG)

1. Create `src/modules/Rag.jsx`.
2. Add a link in `src/components/Sidebar.jsx`:
   ```js
   { path: "/rag", label: "RAG" },
   ```
3. Add a route in `src/App.jsx`:
   ```jsx
   <Route path="/rag" element={<Rag />} />
   ```
4. Call the backend using the shared client:
   ```js
   import { api } from "../api/client";
   const data = await api.get("/rag/...");
   ```

## Troubleshooting

**`'AI' is not recognized...` / `Cannot find module '...\vite\bin\vite.js'` when running `npm run dev`:**
The project path contained a `&` (e.g. `Full Stack & AI ...`). npm runs scripts
through `cmd.exe`, which treats `&` as a command separator and breaks the path.
Fix: rename the folder so it has no `&` (e.g. use `and`), then reopen it in
VS Code and run `npm install` followed by `npm run dev`.

## What was set up for you

- Vite + React app running on the uncommon port **5420**.
- `react-router-dom` for routing between modules.
- A `Sidebar` component to navigate modules.
- `.env` with the backend base URL and an `api` client that reads it.
- A `Home` page that pings the backend `/health` to prove connectivity.
