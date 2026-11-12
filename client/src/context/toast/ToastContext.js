import { createContext } from 'react';

/** @type {import('react').Context<{ showToast: (message: string, options?: { duration?: number }) => void } | null>} */
export const ToastContext = createContext(null);
