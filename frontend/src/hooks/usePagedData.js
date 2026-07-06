import { useEffect, useState } from 'react';
import { extractError } from '../api/client.js';

const EMPTY_PAGE = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

/**
 * Fetch a paged list from the API.
 *
 * @param fetcher     function(params) -> Promise<PageResponse>
 * @param params      query params (page, size, search, ...)
 * @param refreshKey  bump to force a refetch (e.g. after create/delete)
 */
export function usePagedData(fetcher, params, refreshKey = 0) {
  const [data, setData] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetcher(params)
      .then((res) => {
        if (!active) return;
        setData(res);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(extractError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, refreshKey]);

  return { data, loading, error };
}
