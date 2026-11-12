import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toast } from '@/components/ui';
import { ToastContext } from './ToastContext.js';

const DEFAULT_DURATION = 2200;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: '', visible: false });
  const timerRef = useRef();

  const showToast = useCallback((message, { duration = DEFAULT_DURATION } = {}) => {
    window.clearTimeout(timerRef.current);
    setToast({ message, visible: true });
    timerRef.current = window.setTimeout(() => setToast((current) => ({ ...current, visible: false })), duration);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext value={value}>
      {children}
      <Toast message={toast.message} visible={toast.visible} />
    </ToastContext>
  );
}
