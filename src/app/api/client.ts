import type { ApiErrorPayload, ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type QueryParamValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  params?: QueryParams;
  body?: unknown;
}
type ApiMethodOptions = Omit<ApiRequestOptions, 'body' | 'method'>;

// API 요청이 실패했을 때 던질 커스텀 에러 클래스
export class ApiError extends Error {
  status: number;
  code: string;

  constructor({ status, code, message }: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// TODO: 로그인 붙으면 여기서 토큰 읽어오기 (localStorage/store 등)
function getAccessToken(): string | null {
  return null;
}

function buildUrl(path: string, params?: QueryParams) {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set. .env.local 확인');
  }

  const url = new URL(path, API_BASE_URL);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item == null) return;
        url.searchParams.append(key, String(item));
      });
      return;
    }
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function buildBody(body: unknown) {
  if (body == null) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

function buildHeaders(body: unknown, headers?: HeadersInit) {
  const nextHeaders = new Headers(headers);
  const accessToken = getAccessToken();

  if (accessToken) {
    nextHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  if (body != null && !(body instanceof FormData) && !nextHeaders.has('Content-Type')) {
    nextHeaders.set('Content-Type', 'application/json');
  }

  return nextHeaders;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T> | null = null;
  const contentType = response.headers.get('Content-Type');

  try {
    if (contentType?.includes('application/json')) {
      payload = (await response.json()) as ApiResponse<T>;
    }
  } catch {
    throw new ApiError({
      status: response.status,
      code: 'INVALID_RESPONSE',
      message: '서버 응답을 해석하지 못했습니다.',
    });
  }

  if (!payload) {
    if (response.ok) return undefined as T;
    throw new ApiError({
      status: response.status,
      code: 'UNKNOWN_ERROR',
      message: '요청 처리 중 오류가 발생했습니다.',
    });
  }

  if (!response.ok || payload.code !== 'SUCCESS') {
    throw new ApiError({
      status: payload.status ?? response.status,
      code: payload.code ?? 'UNKNOWN_ERROR',
      message: payload.message ?? '요청 처리 중 오류가 발생했습니다.',
    });
  }

  return payload.data;
}

async function request<T>(path: string, options: ApiRequestOptions = {}) {
  const { params, body, headers, ...init } = options;
  const url = buildUrl(path, params);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      body: buildBody(body),
      headers: buildHeaders(body, headers),
    });
  } catch {
    throw new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: '네트워크 오류로 요청을 완료하지 못했습니다.',
    });
  }

  return parseApiResponse<T>(response);
}

export const api = {
  get<T>(path: string, options?: ApiMethodOptions) {
    return request<T>(path, { ...options, method: 'GET' });
  },
  post<T>(path: string, body?: unknown, options?: ApiMethodOptions) {
    return request<T>(path, { ...options, method: 'POST', body });
  },
  put<T>(path: string, body?: unknown, options?: ApiMethodOptions) {
    return request<T>(path, { ...options, method: 'PUT', body });
  },
  patch<T>(path: string, body?: unknown, options?: ApiMethodOptions) {
    return request<T>(path, { ...options, method: 'PATCH', body });
  },
  delete<T>(path: string, options?: ApiMethodOptions) {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
};
