export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    request_id?: string;
    details?: Record<string, unknown>;
  };
}

export class ApiError extends Error {
  public code: string;
  public status: number;
  public requestId?: string;
  public isRetryable: boolean;

  constructor(message: string, code = 'INTERNAL_ERROR', status = 500, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.isRetryable = status === 429 || status >= 500;
  }

  static fromResponse(status: number, data?: ApiErrorResponse): ApiError {
    const errorObj = data?.error;
    const code = errorObj?.code || `HTTP_${status}`;
    const message = errorObj?.message || `Request failed with status ${status}`;
    const requestId = errorObj?.request_id;
    return new ApiError(message, code, status, requestId);
  }
}
