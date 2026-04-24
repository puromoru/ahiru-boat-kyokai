/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORMSPREE_URL?: string;
  readonly VITE_GAS_WEB_APP_URL?: string;
  readonly VITE_REVIEWS_GAS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
