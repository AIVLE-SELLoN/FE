export interface ApiResponse<T> {
  status: number;
  code: string;
  message: string;
  data: T;
}

export interface ApiErrorPayload {
  status: number;
  code: string;
  message: string;
}
