import { createContext } from 'react';

/** `{ user, status: 'loading' | 'ready', signIn, signUp, signOut, updateUser }` — see AuthProvider. */
export const AuthContext = createContext(null);
