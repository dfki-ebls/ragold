/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_INFO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
