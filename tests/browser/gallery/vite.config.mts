import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({ root: fileURLToPath(new URL('.', import.meta.url)), resolve: { alias: { '@': fileURLToPath(new URL('../../../src', import.meta.url)) } }, define: { 'process.env.NEXT_PUBLIC_API_URL': JSON.stringify('http://127.0.0.1:3110/api/v1') }, oxc: { jsx: { runtime: 'automatic' } }, server: { host: '127.0.0.1', port: 3111, strictPort: true, fs: { allow: [fileURLToPath(new URL('../../../', import.meta.url))] } } });
