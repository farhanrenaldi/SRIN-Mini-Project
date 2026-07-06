import { useEffect, useState } from 'react';

/**
 * Load a list of {id, name/title} options (from a `/all` endpoint) for use in
 * select dropdowns. Reloads when `reloadKey` changes.
 */
export function useOptions(fetcher, reloadKey = 0) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetcher()
      .then((data) => {
        if (active) setOptions(data);
      })
      .catch(() => {
        if (active) setOptions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  return { options, loading };
}
