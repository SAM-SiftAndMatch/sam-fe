import type { ApiResponse } from '../types/api';

/** BE success code (API_Specification_v1 §I.1: 1000 = Thành công). */
export const API_SUCCESS_CODE = 1000;

/** Security-alert code: token compromised (redirect handled centrally in axios interceptor). */
export const API_TOKEN_COMPROMISED_CODE = 1016;

export function isSuccessResponse<T>(res: ApiResponse<T> | null | undefined): boolean {
  return res?.code === API_SUCCESS_CODE;
}

export function getApiErrorMessage<T>(
  res: ApiResponse<T> | null | undefined,
  fallback: string
): string {
  const detail = res?.errors ? Object.values(res.errors).filter(Boolean).join('; ') : '';
  const base = res?.message?.trim() ? res.message : fallback;
  return detail ? `${base}: ${detail}` : base;
}

/** For void endpoints (e.g. JB-05 invite returns result null on success). Throws when code !== 1000. */
export function assertApiSuccess<T>(
  res: ApiResponse<T> | null | undefined,
  fallback: string
): asserts res is ApiResponse<T> {
  if (!isSuccessResponse(res)) {
    throw new Error(getApiErrorMessage(res, fallback));
  }
}

/** For data endpoints. Returns the narrowed result; throws on code !== 1000 or nullish result. */
export function requireApiResult<T>(res: ApiResponse<T> | null | undefined, fallback: string): T {
  assertApiSuccess(res, fallback);
  if (res.result === null || res.result === undefined) {
    throw new Error(getApiErrorMessage(res, fallback));
  }
  return res.result;
}

/** Extracts the BE ApiResponse body from an axios failure (for catch blocks). No axios import needed. */
export function extractApiResponse(error: unknown): ApiResponse | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }
  const data = (error as { response?: { data?: unknown } }).response?.data;
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }
  return data as ApiResponse;
}
