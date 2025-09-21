import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3000
    },
    define: {
      'process.env.GOVEE_API_KEY': JSON.stringify(env.GOVEE_API_KEY)
    }
  }
});