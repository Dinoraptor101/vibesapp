interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  grecaptcha: any;
}

// Add missing global type definitions
declare global {
  namespace NodeJS {
    type Timeout = ReturnType<typeof setTimeout>;
  }

  interface WindowEventMap {
    [key: string]: Event;
  }

  interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    integrity?: string;
    keepalive?: boolean;
    signal?: AbortSignal;
  }
}
