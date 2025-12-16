import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // process.cwd() is valid in Node environment but TS might complain if node types are missing in config context.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY so it works in the browser
      // Vercel usually exposes env vars starting with VITE_ to the client
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY)
    },
    build: {
      target: 'esnext'
    }
  }
})