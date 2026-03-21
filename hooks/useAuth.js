// hooks/useAuth.js
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, signOutUser, isFirebaseConfigured } from '../services/firebase';

const AuthCtx = createContext(null);

/** If Firebase never calls back (blocked script, bad config, offline), stop blocking the UI. */
const FIREBASE_READY_MS = 3000;

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = still waiting on Firebase
  const [manual, setManual] = useState(null);
  const [storageChecked, setStorageChecked] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ss_manual_user');
      if (saved) setManual(JSON.parse(saved));
    } catch {}
    setStorageChecked(true);

    if (!isFirebaseConfigured()) {
      setFirebaseUser(null);
      return;
    }

    let unsub = () => {};
    try {
      unsub = onAuthChange((u) => {
        setFirebaseUser(u ?? null);
      });
    } catch (e) {
      console.warn('Firebase auth listener failed:', e);
      setFirebaseUser(null);
      return;
    }
    const t = setTimeout(() => {
      setFirebaseUser((prev) => (prev === undefined ? null : prev));
    }, FIREBASE_READY_MS);
    return () => {
      clearTimeout(t);
      try {
        unsub();
      } catch {
        /* ignore */
      }
    };
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
      console.error('Logout error', e);
    }
  };

  // Resolved user: Firebase user > manual user > null
  const resolvedUser = firebaseUser
    ? {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        photo: firebaseUser.photoURL,
        source: 'google',
      }
    : manual
      ? { ...manual, source: 'manual' }
      : null;

  const loading = !storageChecked || firebaseUser === undefined;

  return (
    <AuthCtx.Provider value={{ user: resolvedUser, loading, setManualUser, clearManualUser, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
