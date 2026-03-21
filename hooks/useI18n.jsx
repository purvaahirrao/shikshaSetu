import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './useAuth';
import { MESSAGES } from '../locales/messages';

const I18nCtx = createContext(null);

const LOCAL_KEY = 'ss_ui_locale';

export function normalizeLocale(s) {
  if (!s) return 'english';
  const l = String(s).toLowerCase();
  if (l === 'hindi' || l === 'hi') return 'hindi';
  if (l === 'marathi' || l === 'mr') return 'marathi';
  if (l === 'english' || l === 'en') return 'english';
  return 'english';
}

export function I18nProvider({ children }) {
  const { user } = useAuth();
  const [guestLocale, setGuestLocaleState] = useState('english');

  useEffect(() => {
    try {
      const s = localStorage.getItem(LOCAL_KEY);
      if (s) setGuestLocaleState(normalizeLocale(s));
    } catch {
      /* ignore */
    }
  }, []);

  // Keep ss_ui_locale and guest state aligned with saved profile language (manual / synced users).
  useEffect(() => {
    if (!user?.language) return;
    const n = normalizeLocale(user.language);
    setGuestLocaleState(n);
    try {
      localStorage.setItem(LOCAL_KEY, n);
    } catch {
      /* ignore */
    }
  }, [user?.language]);

  const setGuestLocale = useCallback((loc) => {
    const n = normalizeLocale(loc);
    setGuestLocaleState(n);
    try {
      localStorage.setItem(LOCAL_KEY, n);
    } catch {
      /* ignore */
    }
  }, []);

  const locale = useMemo(() => {
    if (user?.language) return normalizeLocale(user.language);
    return normalizeLocale(guestLocale);
  }, [user?.language, guestLocale]);

  const t = useCallback(
    (key, params) => {
      const table = MESSAGES[locale] || MESSAGES.english;
      const fallback = MESSAGES.english;
      let s = table[key] ?? fallback[key] ?? key;
      if (params && typeof params === 'object') {
        Object.keys(params).forEach((k) => {
          s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(params[k]));
        });
      }
      return s;
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, t, setGuestLocale }),
    [locale, t, setGuestLocale],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return ctx;
}
