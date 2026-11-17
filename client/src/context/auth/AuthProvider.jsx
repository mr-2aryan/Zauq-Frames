import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '@/services/authApi';
import { AuthContext } from './AuthContext.js';

/**
 * Who is signed in. Asks the server once on load (the session is an httpOnly
 * cookie, so the browser can't read it), then keeps the user in step with
 * sign in / sign up / sign out and profile changes.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();
    authApi
      .getCurrentUser({ signal: controller.signal })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => {
        if (!controller.signal.aborted) setStatus('ready');
      });
    return () => controller.abort();
  }, []);

  const signIn = useCallback(async (credentials) => {
    const data = await authApi.signIn(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const signUp = useCallback(async (details) => {
    const data = await authApi.signUp(details);
    setUser(data.user);
    return data.user;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut().catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, status, signIn, signUp, signOut, updateUser: setUser }), [user, status, signIn, signUp, signOut]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
