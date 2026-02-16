import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  
  const allowedHosts = (env.VITE_ALLOWED_HOSTS || "localhost,127.0.0.1")
    .split(",")
    .map((h) => h.trim());

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      allowedHosts
    }
  };
});
