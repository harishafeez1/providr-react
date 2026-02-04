/// <reference types="vite/client" />

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_APP_GOOGLE_API_KEY?: string;
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string;
  readonly VITE_APP_AWS_URL?: string;
  readonly VITE_APP_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}