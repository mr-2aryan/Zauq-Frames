import { useCallback, useEffect, useState } from 'react';

const LOADING = { status: 'loading', data: null, error: null };

/**
 * Loads data with an abortable fetcher and re-runs when `key` changes.
 *
 * @template T
 * @param {(options: { signal: AbortSignal }) => Promise<T>} fetcher
 * @param {string} key A string that changes whenever the request should re-run.
 * @returns {{ status: 'loading' | 'success' | 'error', data: T | null, error: Error | null, reload: () => void }}
 */
export function useQuery(fetcher, key) {
  const [state, setState] = useState(LOADING);
  const [attempt, setAttempt] = useState(0);
  const [trackedKey, setTrackedKey] = useState(key);

  // A new request shows the loading state straight away (no stale data from the previous key).
  if (key !== trackedKey) {
    setTrackedKey(key);
    setState(LOADING);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetcher({ signal: controller.signal })
      .then((data) => setState({ status: 'success', data, error: null }))
      .catch((error) => {
        if (!controller.signal.aborted) setState({ status: 'error', data: null, error });
      });
    return () => controller.abort();
    // `key` stands in for the fetcher's inputs.
  }, [key, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(() => {
    setState(LOADING);
    setAttempt((count) => count + 1);
  }, []);

  return { ...state, reload };
}
