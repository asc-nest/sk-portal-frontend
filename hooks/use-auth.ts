'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import apiClient from '@/lib/api/client';

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAndLoadSession = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;

      const storedToken = localStorage.getItem('sk_token');
      const storedUser = localStorage.getItem('sk_user');
      const storedExpiry = localStorage.getItem('sk_session_expires_at');

      if (!storedToken || !storedUser) {
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Check 8-hour expiration
      if (storedExpiry && Date.now() > Number(storedExpiry)) {
        console.warn('SK Session expired (8 hours passed). Clearing session.');
        localStorage.removeItem('sk_token');
        localStorage.removeItem('sk_user');
        localStorage.removeItem('sk_session_expires_at');
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error('Error loading stored session', e);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount and listen to storage / custom events
  useEffect(() => {
    checkAndLoadSession();

    const handleAuthChange = () => {
      checkAndLoadSession();
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('sk_auth_changed', handleAuthChange);

    // Periodic check every 60 seconds to enforce 8-hour expiration
    const interval = setInterval(checkAndLoadSession, 60000);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('sk_auth_changed', handleAuthChange);
      clearInterval(interval);
    };
  }, [checkAndLoadSession]);

  const login = useCallback((newToken: string, newUser: User) => {
    const expiresAt = Date.now() + EIGHT_HOURS_MS;
    localStorage.setItem('sk_token', newToken);
    localStorage.setItem('sk_user', JSON.stringify(newUser));
    localStorage.setItem('sk_session_expires_at', expiresAt.toString());
    setToken(newToken);
    setUser(newUser);
    window.dispatchEvent(new Event('sk_auth_changed'));
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await apiClient.post('/auth/logout');
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('sk_token');
      localStorage.removeItem('sk_user');
      localStorage.removeItem('sk_session_expires_at');
      setToken(null);
      setUser(null);
      window.dispatchEvent(new Event('sk_auth_changed'));
      window.location.href = '/login';
    }
  }, [token]);

  const hasRole = useCallback((role: string) => {
    return user?.roles?.includes(role) ?? false;
  }, [user]);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    hasRole,
    refreshSession: checkAndLoadSession,
  };
}

export default useAuth;
