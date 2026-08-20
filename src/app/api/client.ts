import { useAuthStore } from '@/store/useAuthStore';
import type { ApiErrorPayload, ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const REISSUE_PATH = '/api/v1/sellon/auth/reissue';

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

function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

function stripBearer(value: string | null): string | null {
  return value?.replace(/^Bearer\s+/i, '') ?? null;
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

  if (!response.ok) {
    throw new ApiError({
      status: payload.status ?? response.status,
      code: payload.code ?? 'UNKNOWN_ERROR',
      message: payload.message ?? '요청 처리 중 오류가 발생했습니다.',
    });
  }

  return payload.data;
}

// AuthContext(useAuth())는 별도로 localStorage에 user를 들고 있어서, 토큰 쪽에서 세션이
// 끊길 때 그쪽도 같이 지워줘야 화면(AuthGuard 등)이 "아직 로그인된 것"으로 착각하지 않는다.
const AUTH_USER_STORAGE_KEY = 'sellon_auth_user';

// client.ts는 React 트리 밖의 순수 모듈이라 useRouter/useAuth를 못 쓴다.
// 그래서 재발급이 최종 실패했을 때는 localStorage를 직접 정리하고 하드 리다이렉트로 로그인 페이지로 보낸다.
function forceLogoutRedirect() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch {
    // ignore
  }
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

function handleRefreshFailure(): false {
  useAuthStore.getState().clearTokens();
  forceLogoutRedirect();
  return false;
}

// 여러 요청이 동시에 401을 맞아도 /auth/reissue는 한 번만 호출되도록 진행 중인 재발급을 공유한다.
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(buildUrl(REISSUE_PATH), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          return handleRefreshFailure();
        }

        const accessToken = stripBearer(response.headers.get('Authorization'));
        const newRefreshToken = stripBearer(response.headers.get('Refresh-Token'));

        if (!accessToken || !newRefreshToken) {
          return handleRefreshFailure();
        }

        useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        return true;
      } catch {
        return handleRefreshFailure();
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// 로그인 자체가 401로 실패한 경우(비밀번호 틀림 등)까지 재발급을 시도하면 안 되므로 제외.
// reissue 자체가 401이면(리프레시 토큰도 만료) 무한 루프를 막기 위해 재시도하지 않는다.
function shouldAttemptRefresh(path: string): boolean {
  return !path.includes('/auth/login') && !path.includes('/auth/reissue');
}

async function fetchOnce(url: string, init: RequestInit, body: unknown, headers?: HeadersInit) {
  try {
    return await fetch(url, {
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
}

async function request<T>(path: string, options: ApiRequestOptions = {}) {
  const { params, body, headers, ...init } = options;
  const url = buildUrl(path, params);

  const response = await fetchOnce(url, init, body, headers);

  if (response.status === 401 && shouldAttemptRefresh(path)) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const retryResponse = await fetchOnce(url, init, body, headers);
      return parseApiResponse<T>(retryResponse);
    }
  }

  return parseApiResponse<T>(response);
}

async function requestRaw<T>(path: string, options: ApiRequestOptions = {}) {
  const { params, body, headers, ...init } = options;
  const url = buildUrl(path, params);

  let response = await fetchOnce(url, init, body, headers);

  if (response.status === 401 && shouldAttemptRefresh(path)) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      response = await fetchOnce(url, init, body, headers);
    }
  }

  const data = await parseApiResponse<T>(response);
  return { data, headers: response.headers };
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
  postRaw<T>(path: string, body?: unknown, options?: ApiMethodOptions) {
    return requestRaw<T>(path, { ...options, method: 'POST', body });
  },
};