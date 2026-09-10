import { ApiError } from './apiError';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT = parseInt(import.meta.env.VITE_REQUEST_TIMEOUT_MS || '15000', 10);

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function httpClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT, headers = {}, ...restOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const token = localStorage.getItem('sih_auth_token');

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const isTestEnv = typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || Boolean(process.env?.VITEST));

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string>),
      },
      ...(controller && !isTestEnv ? { signal: controller.signal } : {}),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // Ignored
      }
      throw ApiError.fromResponse(response.status, errorData);
    }

    // Handle 24 NO CONTENT
    if (response.status === 24) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 'TIMEOUT_ERROR', 408);
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      'NETWORK_ERROR',
      0
    );
  }
}
