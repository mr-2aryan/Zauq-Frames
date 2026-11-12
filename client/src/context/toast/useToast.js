import { use } from 'react';
import { ToastContext } from './ToastContext.js';

/** Show short status messages. Must be used inside `<ToastProvider>`. */
export function useToast() {
  const context = use(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>.');
  return context;
}
