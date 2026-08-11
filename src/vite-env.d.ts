/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VOUCHER_URL?: string
  readonly VOUCHER_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
