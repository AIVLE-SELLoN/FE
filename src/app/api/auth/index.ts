import { api } from '../client';
import { loginResponseSchema, type LoginResponse } from './types';
import { useAuthStore } from '@/store/useAuthStore';

interface LoginRequest {
  email: string;
  password: string;
}

export async function postLogin(req: LoginRequest): Promise<LoginResponse> {
  const { data, headers } = await api.postRaw<unknown>('/api/v1/sellon/auth/login', req);

  const accessToken = headers.get('Authorization');
  const refreshToken = headers.get('Refresh-Token');
  if (accessToken && refreshToken) {
    useAuthStore.getState().setTokens(accessToken, refreshToken);
  }

  return loginResponseSchema.parse(data);
}