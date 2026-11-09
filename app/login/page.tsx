'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import useSystemSettings from '@/hooks/use-system-settings';

export default function LoginPage() {
  const router = useRouter();
  const { settings } = useSystemSettings();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeoutMinutes = settings.session_timeout_minutes || 480;
  const timeoutHours = Math.round(timeoutMinutes / 60);
  const timeoutText = timeoutMinutes % 60 === 0 && timeoutHours > 0
    ? `${timeoutHours} oras`
    : `${timeoutMinutes} minuto`;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Mangyaring ilagay ang inyong Email o Username at Password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/login', {
        identifier,
        password,
        remember,
      });

      if (response.data?.success && response.data?.data?.token) {
        const { token, user } = response.data.data;
        const grantedTimeout = response.data.data.session_timeout_minutes || timeoutMinutes;
        const expiresAt = Date.now() + grantedTimeout * 60 * 1000;
        localStorage.setItem('sk_token', token);
        localStorage.setItem('sk_user', JSON.stringify(user));
        localStorage.setItem('sk_session_expires_at', expiresAt.toString());
        localStorage.setItem('sk_session_timeout_mins', grantedTimeout.toString());
        window.dispatchEvent(new Event('sk_auth_changed'));
        if (user?.roles?.includes('super_admin') || user?.username === 'superadmin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(response.data?.message || 'Login failed. Please check your username/email and password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const apiMessage = err.response?.data?.message;
      if (err.response?.status === 503 || err.response?.data?.error_code === 'MAINTENANCE_MODE_ACTIVE') {
        setError(apiMessage || 'Kasalukuyang nasa Maintenance Mode ang portal. Tanging Super Administrators lamang ang maaaring mag-login.');
      } else {
        setError(apiMessage || 'Maling impormasyon o hindi nakakonekta sa server. Pakisubukan muli.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9fb] text-[#1b1c1e] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-[460px] mx-auto my-auto">
        {/* Authentication Card */}
        <div className="rounded-2xl bg-white shadow-xl border border-[#efedf0] p-8 sm:p-10">
          {/* Header */}
          <div className="pb-5 mb-5 border-b border-[#efedf0]">
            <h1 className="font-['Poppins'] text-2xl font-bold text-[#0e0f0f] tracking-tight">
              {settings.portal_name || 'Portal Authentication'}
            </h1>
            <p className="text-xs text-[#43474d] mt-1">
              {settings.jurisdiction_name || 'Opisyal na pag-login para sa mga lider ng Sangguniang Kabataan'}
            </p>
          </div>

          {settings.maintenance_mode && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg">engineering</span>
              <div>
                <strong className="block font-bold">Naka-Maintenance Mode ang Portal</strong>
                <span>Ang mga Super Administrator lamang ang pinapayagang mag-login sa ngayon.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <div className="mb-1.5">
                <label className="text-xs font-bold text-[#1b1c1e] uppercase tracking-wide">
                  Official Email / Username
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777e]">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="chairperson@skportal.gov.ph o jpsantos"
                  className="w-full h-11 pl-11 pr-4 bg-white text-[#1b1c1e] placeholder:text-[#c4c6ce] text-sm rounded-lg border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00] focus:ring-2 focus:ring-[#ba0c00]/10 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#1b1c1e] uppercase tracking-wide">
                  Password o Encrypted Passcode
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777e]">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-11 pr-11 bg-white text-[#1b1c1e] text-sm rounded-lg border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00] focus:ring-2 focus:ring-[#ba0c00]/10 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#74777e] hover:text-[#0e0f0f] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded text-[#ba0c00] focus:ring-0 cursor-pointer accent-[#ba0c00]"
                />
                <span className="text-xs text-[#43474d]">Manatiling naka-login ({timeoutText})</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#242424] hover:bg-[#ba0c00] text-white rounded-lg font-['Poppins'] font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Pumasok sa SK Portal</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>

            <div className="mt-4 pt-4 border-t border-[#efedf0] text-center">
              {settings.allow_public_onboarding ? (
                <p className="text-xs text-[#74777e]">
                  Bagong halal o hinirang na opisyal?{' '}
                  <Link href="/onboarding" className="text-[#ba0c00] font-bold hover:underline">
                    Mag-rehistro / Mag-onboard dito
                  </Link>
                </p>
              ) : (
                <p className="text-xs text-[#74777e] italic">
                  Pansamantalang sarado ang online registration ng SK Officials ayon sa patakaran ng Super Administrator.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
