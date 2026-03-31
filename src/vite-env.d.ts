/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** Slug da organização cujo portal de instaladores abre na raiz / (opcional) */
  readonly VITE_PUBLIC_ORG_SLUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
