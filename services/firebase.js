// services/firebase.js — see .env.example for NEXT_PUBLIC_FIREBASE_* (optional; email/password works without).

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            || 'YOUR_API_KEY',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        || 'YOUR_PROJECT.firebaseapp.com',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         || 'YOUR_PROJECT_ID',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID|| 'YOUR_SENDER_ID',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             || 'YOUR_APP_ID',
};

// Prevent duplicate init in Next.js dev (hot-reload)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/** False when .env still has placeholders — avoids hanging on onAuthStateChanged. */
export function isFirebaseConfigured() {
  const k = String(firebaseConfig.apiKey || '');
  const p = String(firebaseConfig.projectId || '');
  if (!k || !p) return false;
  if (k.includes('YOUR_') || p.includes('YOUR_')) return false;
  return true;
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  if (!isFirebaseConfigured()) {
    throw new Error('Google sign-in needs Firebase keys in .env (NEXT_PUBLIC_FIREBASE_*). Use email/password or add your Firebase config.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser() {
  if (!isFirebaseConfigured()) return;
  await signOut(auth);
}

export function onAuthChange(callback) {
  if (!isFirebaseConfigured()) {
    queueMicrotask(() => callback(null));
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export { auth };
