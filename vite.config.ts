import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['react-syntax-highlighter'],
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress warnings about unresolved dynamic imports from refractor
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.message.includes('refractor')) {
          return;
        }
        warn(warning);
      },
    },
  },
}));
