/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FASTAPI_BASE_URL: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
