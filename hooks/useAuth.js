// hooks/useAuth.js
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, signOutUser } from '../services/firebase';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(undefined); // undefined = loading
  const [manual, setManual] = useState(null);       // fallback manual user

  useEffect(() => {
    // Try to load manual user from localStorage
    try {
      const saved = localStorage.getItem('ss_manual_user');
      if (saved) setManual(JSON.parse(saved));
    } catch {}

    // Firebase auth state listener
    const unsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
    return unsub;
  }, []);

  const setManualUser = (u) => {
    localStorage.setItem('ss_manual_user', JSON.stringify(u));
    setManual(u);
  };

  const clearManualUser = () => {
    localStorage.removeItem('ss_manual_user');
    setManual(null);
  };

  const logout = async () => {
    clearManualUser();
    try {
      await signOutUser();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  // Resolved user: Firebase user > manual user > null
  const resolvedUser = user
    ? { uid: user.uid, name: user.displayName, email: user.email, photo: user.photoURL, source: 'google' }
    : manual
    ? { ...manual, source: 'manual' }
    : null;

  const loading = user === undefined;

  return (
    <AuthCtx.Provider value={{ user: resolvedUser, loading, setManualUser, clearManualUser, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (ctx == null) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
