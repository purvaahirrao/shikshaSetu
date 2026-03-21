import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';
import { homePathForRole } from '../services/localAuth';

/**
 * Redirects to login if not authenticated; redirects to role home if role mismatch.
 * @param {string | string[] | null} requiredRoles — e.g. 'student' or ['parent','teacher']; null = any role
 */
export function useRequireRole(requiredRoles = null) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const roleKey =
    requiredRoles == null
      ? ''
      : (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]).join(',');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    const allowed = roleKey === '' ? null : roleKey.split(',');
    if (allowed && allowed.length && !allowed.includes(user.role)) {
      router.replace(homePathForRole(user.role));
    }
  }, [user, loading, router, roleKey]);

  return { user, loading };
}
