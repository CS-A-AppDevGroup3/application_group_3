import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port 5173 matches CLIENT_ORIGIN in the backend .env, so CORS works out of the box.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
