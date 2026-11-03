'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api/client';
import CivicLoader from '@/components/ui/civic-loader';

function InviteContent() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [bioAdvocacy, setBioAdvocacy] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyToken() {
      if (!token) return;
      try {
        setLoading(true);
        setVerifyError(null);
        const res = await apiClient.get(`/invitations/verify/${token}`);
        if (res.data?.success && res.data?.data) {
          setInvitation(res.data.data);
          const suggested = `${res.data.data.first_name || ''}${res.data.data.last_name || ''}`
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
          if (suggested) setUsername(suggested);
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setVerifyError(
          err.response?.data?.message || 'This invitation link is invalid or has expired.'
        );
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setFormError('Ang mga password ay hindi magkatugma.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const res = await apiClient.post('/invitations/accept', {
        token,
        username,
        password,
        password_confirmation: passwordConfirmation,
        contact_number: contactNumber,
        bio_advocacy: bioAdvocacy,
      });

      if (res.data?.success && res.data?.data?.token) {
        const { token: authToken, user } = res.data.data;
        const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
        localStorage.setItem('sk_token', authToken);
        localStorage.setItem('sk_user', JSON.stringify(user));
        localStorage.setItem('sk_session_expires_at', expiresAt.toString());
        window.dispatchEvent(new Event('sk_auth_changed'));
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Accept error:', err);
      setFormError(err.response?.data?.message || 'Bigo ang pag-activate ng profile. Pakisuri ang impormasyon.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9fb] p-4">
        <CivicLoader
          size="lg"
          label="Sinisuri ang Official Invitation Link..."
          sublabel="Taguig SK Federation Onboarding Portal"
        />
      </div>
    );
  }

  if (verifyError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9fb] p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-rose-200 shadow-xl rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="font-['Poppins'] text-xl font-bold text-[#0e0f0f]">
            Hindi Wasto ang Invitation Link
          </h2>
          <p className="text-xs text-[#74777e] leading-relaxed">
            {verifyError || 'Ang invitation link na ito ay nag-expire na o nagamit na sa ibang sesyon.'}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full py-2.5 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Bumalik sa Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const roleTitle = `SK ${invitation.position?.toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#faf9fb] text-[#1b1c1e] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-xl w-full space-y-6 my-auto">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-[#ba0c00]">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Official Council Onboarding • Taguig City
          </div>
          <h1 className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0e0f0f]">
            Welcome to the SK Council
          </h1>
          <p className="text-xs sm:text-sm text-[#74777e]">
            I-activate ang inyong opisyal na profile para sa Barangay Central, Lungsod ng Taguig.
          </p>
        </div>

        {/* Main Card Shell */}
        <div className="bg-white border border-[#efedf0] rounded-2xl shadow-xl overflow-hidden">
          {/* Top Designated Official Banner */}
          <div className="bg-[#242424] text-white p-6 border-b-4 border-[#ba0c00]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#eebd90] block mb-1">
                  Designated Official
                </span>
                <h3 className="font-['Poppins'] text-xl font-bold text-white">
                  {invitation.first_name} {invitation.last_name}
                </h3>
                <p className="text-xs text-[#c8c6c5] mt-0.5">{invitation.email}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#ba0c00] text-white text-xs font-bold font-mono shadow-sm shrink-0">
                {roleTitle}
              </span>
            </div>
            {invitation.committee_assigned && (
              <div className="mt-3 pt-3 border-t border-neutral-700/80 text-xs text-[#eebd90]">
                <strong>Committee:</strong> {invitation.committee_assigned}
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1.5">
                  Choose Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777e]">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. jpsantos"
                    className="w-full h-11 pl-11 pr-4 bg-white text-[#1b1c1e] text-sm rounded-lg border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00] focus:ring-2 focus:ring-[#ba0c00]/10 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1.5">
                    Password (min 8 characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777e]">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-11 pr-10 bg-white text-[#1b1c1e] text-sm rounded-lg border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00] focus:ring-2 focus:ring-[#ba0c00]/10 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777e]">
                      <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-11 pr-10 bg-white text-[#1b1c1e] text-sm rounded-lg border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00] focus:ring-2 focus:ring-[#ba0c00]/10 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#74777e] hover:text-[#0e0f0f] flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                  <span>{showPassword ? 'Itago ang password' : 'Ipakita ang password'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1.5">
                  Contact Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777e]">
                    <span className="material-symbols-outlined text-[18px]">phone</span>
                  </div>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="0917XXXXXXX"
                    className="w-full h-11 pl-11 pr-4 bg-white text-[#1b1c1e] text-sm rounded-lg border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00] focus:ring-2 focus:ring-[#ba0c00]/10 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1.5">
                  Youth Advocacy &amp; Leadership Vision (Optional)
                </label>
                <textarea
                  rows={3}
                  value={bioAdvocacy}
                  onChange={(e) => setBioAdvocacy(e.target.value)}
                  placeholder="Share a short statement on your advocacy for the youth..."
                  className="w-full rounded-lg border border-[#c4c6ce] p-3 text-sm bg-white text-[#1b1c1e] focus:outline-none focus:border-[#ba0c00] focus:ring-2 focus:ring-[#ba0c00]/10 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-[#ba0c00] hover:bg-[#e81100] text-white rounded-lg font-['Poppins'] font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 mt-4"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Activation &amp; Enter Portal</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf9fb]">
          <div className="text-center space-y-3">
            <div className="h-10 w-10 border-4 border-[#ba0c00] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-[#43474d]">Inihahanda ang onboarding portal...</p>
          </div>
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
