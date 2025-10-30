// API-related type definitions
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    nextPage?: number;
    totalPages?: number;
  };
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData | Blob;
  timeout?: number;
}

export interface ApiServiceHeaders {
  'Content-Type'?: string;
  'X-Api-Key'?: string;
  'X-Pigeon-Id'?: string;
}
