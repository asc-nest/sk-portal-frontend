'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';

export interface SystemSettings {
  portal_name: string;
  jurisdiction_name: string;
  current_term_label: string;
  term_start_date: string;
  term_end_date: string;
  allow_public_onboarding: boolean;
  skmt_enforcement: boolean;
  session_timeout_minutes: number;
  maintenance_mode: boolean;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  portal_name: 'Taguig City SK Officials Portal',
  jurisdiction_name: 'City of Taguig - Sangguniang Kabataan Federation',
  current_term_label: 'Term 2023 – 2026',
  term_start_date: '2023-11-01',
  term_end_date: '2026-11-01',
  allow_public_onboarding: true,
  skmt_enforcement: true,
  session_timeout_minutes: 480,
  maintenance_mode: false,
};

const SETTINGS_STORAGE_KEY = 'sk_public_settings';

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (cached) {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiClient.get('/system/settings');
      if (res.data?.success && res.data?.data) {
        const merged: SystemSettings = {
          ...DEFAULT_SETTINGS,
          ...res.data.data,
        };
        setSettings(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
          if (merged.portal_name && typeof document !== 'undefined') {
            document.title = merged.portal_name;
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch latest system settings, using defaults/cached:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const handleSettingsUpdated = () => {
      fetchSettings();
    };

    window.addEventListener('sk_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', handleSettingsUpdated);

    return () => {
      window.removeEventListener('sk_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleSettingsUpdated);
    };
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    refreshSettings: fetchSettings,
  };
}

export default useSystemSettings;

