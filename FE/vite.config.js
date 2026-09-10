import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Weird dev port so it does not clash with other projects.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5420,
  },
});
