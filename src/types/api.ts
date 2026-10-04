export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  result?: T;
  errors?: Record<string, string>;
  timestamp?: string;
  path?: string;
}
