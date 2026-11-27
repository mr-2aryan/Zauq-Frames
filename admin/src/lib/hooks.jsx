import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import { createContext, use, useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';

/**
 * Loads `path` from the admin API (and again when `path` changes or `reload()`
 * is called). Returns { data, error, loading, reload, setData }.
 */
export function useData(path) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!path) return undefined;
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path, { signal: controller.signal })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState((s) => ({ ...s, error, loading: false }));
      });
    return () => controller.abort();
  }, [path, tick]);
  const reload = useCallback(() => setTick((n) => n + 1), []);
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), []);
  return { ...state, reload, setData };
}

/** Keeps a value only after the user has stopped typing for `ms`. */
export function useDebounced(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

// ---------- Notifications (snackbar) and confirmations ----------

const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const resolver = useRef(null);

  const notify = useCallback((message, severity = 'success') => setToast({ message, severity, key: Date.now() }), []);
  const ask = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setConfirm(typeof options === 'string' ? { title: options } : options);
      }),
    [],
  );
  const close = (answer) => {
    resolver.current?.(answer);
    setConfirm(null);
  };

  return (
    <UiContext value={{ notify, confirm: ask }}>
      {children}
      <Snackbar key={toast?.key} open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ fontWeight: 600 }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
      <Dialog open={Boolean(confirm)} onClose={() => close(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{confirm?.title}</DialogTitle>
        {confirm?.text && (
          <DialogContent>
            <DialogContentText>{confirm.text}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => close(false)}>Cancel</Button>
          <Button variant="contained" color={confirm?.danger ? 'error' : 'primary'} onClick={() => close(true)} autoFocus>
            {confirm?.confirmLabel ?? 'Yes'}
          </Button>
        </DialogActions>
      </Dialog>
    </UiContext>
  );
}

/** { notify(message, severity?), confirm({ title, text?, danger?, confirmLabel? }) → Promise<boolean> } */
export const useUi = () => use(UiContext);
