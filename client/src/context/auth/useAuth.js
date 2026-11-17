import { use } from 'react';
import { AuthContext } from './AuthContext.js';

/** The signed-in customer (or null) and sign in / out. Must be used inside `<AuthProvider>`. */
export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
