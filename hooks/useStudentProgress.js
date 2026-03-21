// Live-ish progress: per-user localStorage + optional Postgres pull; refreshes on focus, route, storage events.

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  getProgressUserId,
  getProgressStorageKey,
  loadProgress,
  pullProgressFromPostgres,
  defaultProgress,
} from '../services/userProgress';
import { getLevel, getXpForNextLevel, getXpProgress } from './useGameSystem';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useStudentProgress(user) {
  const router = useRouter();
  const [progress, setProgress] = useState(defaultProgress);

  const refresh = useCallback(() => {
    const id = getProgressUserId(user);
    if (!id) {
      setProgress(defaultProgress());
      return;
    }
    setProgress(loadProgress(id));
  }, [user?.uid, user?.email, user?.postgresUserId, user?.source]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Merge server aggregates when we have a Postgres user UUID
  useEffect(() => {
    const storeId = getProgressUserId(user);
    const apiId =
      (user?.postgresUserId && UUID_RE.test(String(user.postgresUserId)) && String(user.postgresUserId)) ||
      (user?.uid && UUID_RE.test(String(user.uid)) ? String(user.uid) : null);
    if (!apiId || !storeId) return;
    let cancelled = false;
    pullProgressFromPostgres(apiId, storeId).then(() => {
      if (!cancelled) refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [user?.postgresUserId, user?.uid, user?.email, user?.source, refresh]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [refresh]);

  useEffect(() => {
    if (!router.events) return;
    const onDone = () => refresh();
    router.events.on('routeChangeComplete', onDone);
    return () => router.events.off('routeChangeComplete', onDone);
  }, [router.events, refresh]);

  useEffect(() => {
    const sk = getProgressStorageKey(getProgressUserId(user));
    if (!sk) return;
    const onStorage = (e) => {
      if (e.key === sk) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user?.uid, user?.email, user?.postgresUserId, refresh]);

  const xp = progress.xp || 0;

  return {
    progress,
    refresh,
    xp,
    level: getLevel(xp),
    xpProgress: getXpProgress(xp),
    xpForNextLevel: getXpForNextLevel(xp),
    streak: progress.streak || 0,
    questionsSolved: progress.questionsSolved || 0,
    quizSessions: progress.quizSessions || 0,
    scansCompleted: progress.scansCompleted || 0,
    chatTurns: progress.chatTurns || 0,
  };
}
