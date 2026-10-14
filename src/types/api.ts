export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  result?: T;
  errors?: Record<string, string>;
  timestamp?: string;
  path?: string;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
