/** Relative time strings via UI locale (`t` from useI18n). */
export function formatRelativeTimeI18n(ts, t) {
  if (!ts) return '';
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return t('time_justNow');
  if (sec < 3600) return t('time_minAgo', { n: Math.floor(sec / 60) });
  if (sec < 86400) return t('time_hourAgo', { n: Math.floor(sec / 3600) });
  if (sec < 172800) return t('time_yesterday');
  return t('time_dayAgo', { n: Math.floor(sec / 86400) });
}
