import { useState, useEffect, useCallback } from 'react';

// Generic hook for fetching data from API
export function useApi(fetchFn, defaultValue = null, deps = []) {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err);
      setData(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetch();
  }, deps);

  return { data, loading, error, refetch: fetch };
}

// Hook for data that should be fetched once and cached
export function useCachedApi(key, fetchFn, defaultValue = null) {
  const [data, setData] = useState(() => {
    // Try to get from sessionStorage
    const cached = sessionStorage.getItem(`api_${key}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we have cached data, don't fetch again
    if (data && data !== defaultValue) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      try {
        const result = await fetchFn();
        setData(result);
        // Cache in sessionStorage
        sessionStorage.setItem(`api_${key}`, JSON.stringify(result));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [key]);

  return { data, loading, error };
}

export default useApi;
