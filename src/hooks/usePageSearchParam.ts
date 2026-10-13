import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function readPageParam(value: string | null): number {
  if (!value || !/^[1-9]\d*$/.test(value)) return 0;
  const page = Number(value);
  return Number.isSafeInteger(page) && page <= 2_147_483_647 ? page - 1 : 0;
}

export function usePageSearchParam(param = 'page', enabled = true) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPageParam(searchParams.get(param));

  useEffect(() => {
    if (!enabled) return;
    if (searchParams.get(param) === String(page + 1)) return;
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set(param, String(page + 1));
        return next;
      },
      { replace: true }
    );
  }, [enabled, page, param, searchParams, setSearchParams]);

  const setPage = useCallback(
    (nextPage: number, replace = false) => {
      const normalized = Math.max(0, Math.trunc(nextPage));
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set(param, String(normalized + 1));
          return next;
        },
        { replace }
      );
    },
    [param, setSearchParams]
  );

  return [page, setPage] as const;
}
