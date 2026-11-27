import { createContext, use, useCallback, useEffect, useState } from 'react';
import { api } from './lib/api.js';

/** Signs out after an hour with no mouse, keyboard or touch activity (the server does the same). */
const IDLE_MS = 60 * 60 * 1000;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(undefined); // undefined = still checking
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api('/auth/me')
      .then((data) => setAdmin(data.admin))
      .catch(() => setAdmin(null));
    const signedOut = () => {
      setAdmin((current) => {
        if (current) setNotice('Your session ended. Please sign in again.');
        return null;
      });
    };
    window.addEventListener('admin:signed-out', signedOut);
    return () => window.removeEventListener('admin:signed-out', signedOut);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    setNotice('');
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(async (message = '') => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setNotice(message);
    setAdmin(null);
  }, []);

  // Idle sign-out.
  useEffect(() => {
    if (!admin) return undefined;
    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => logout('You were signed out after an hour of no activity.'), IDLE_MS);
    };
    const events = ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [admin, logout]);

  return <AuthContext value={{ admin, login, logout, notice }}>{children}</AuthContext>;
}

export const useAuth = () => use(AuthContext);
