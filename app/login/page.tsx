'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [barangay, setBarangay] = useState('Fort Bonifacio');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Mangyaring ilagay ang inyong Email, Username, o SK ID at Password.');
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
        const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
        localStorage.setItem('sk_token', token);
        localStorage.setItem('sk_user', JSON.stringify(user));
        localStorage.setItem('sk_session_expires_at', expiresAt.toString());
        window.dispatchEvent(new Event('sk_auth_changed'));
        router.push('/dashboard');
      } else {
        setError(response.data?.message || 'Login failed. Please check your username/email and password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const apiMessage = err.response?.data?.message;
      setError(apiMessage || 'Maling impormasyon o hindi nakakonekta sa server. Pakisubukan muli.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9fb] text-[#1b1c1e] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl mx-auto my-auto">
        {/* Main Dual Bento Authentication Shell */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl bg-white shadow-xl border border-[#efedf0] overflow-hidden">
          {/* Left Panel: Institutional Identity */}
          <div className="lg:col-span-5 bg-[#242424] text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#0e0f0f] opacity-40 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-start">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-[#eebd90] hover:text-white transition-colors mb-6 font-semibold"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Bumalik sa Public Portal
              </Link>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#ba0c00] flex items-center justify-center text-white font-extrabold text-lg shadow-md font-['Poppins'] shrink-0">
                  SK
                </div>
                <div>
                  <span className="bg-[#ba0c00] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mb-1 tracking-wide">
                    Republika ng Pilipinas
                  </span>
                  <h2 className="font-['Poppins'] text-lg font-bold text-white tracking-tight leading-tight">
                    Lungsod ng Taguig
                  </h2>
                  <p className="text-xs font-semibold text-[#c8c6c5]">
                    Sangguniang Kabataan Federation
                  </p>
                </div>
              </div>

              <div>
                <h1 className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
                  SK Officials Portal
                </h1>
                <p className="text-xs sm:text-sm text-[#c8c6c5] leading-relaxed">
                  Ang opisyal na plataporma para sa mga halal at hinirang na opisyal ng Sangguniang Kabataan sa Lungsod ng Taguig.
                </p>
              </div>
            </div>

            {/* Key Civic Metrics Quick-Bar */}
            <div className="relative z-10 mt-8 py-4 px-5 rounded-xl bg-[#0e0f0f]/80 backdrop-blur-sm border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-[11px] font-bold text-[#c8c6c5] uppercase tracking-wider">
                <span>Barangay Youth Network</span>
                <span className="text-[#eebd90]">38 Barangays Connected</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-[#242424] p-2.5 rounded-lg border border-white/5">
                  <span className="block font-['Poppins'] text-base sm:text-lg font-bold text-white">100%</span>
                  <span className="block text-[10px] text-[#c8c6c5]">SK Councils</span>
                </div>
                <div className="bg-[#242424] p-2.5 rounded-lg border border-white/5">
                  <span className="block font-['Poppins'] text-base sm:text-lg font-bold text-white">12.4k</span>
                  <span className="block text-[10px] text-[#c8c6c5]">KK Members</span>
                </div>
                <div className="bg-[#242424] p-2.5 rounded-lg border border-white/5">
                  <span className="block font-['Poppins'] text-base sm:text-lg font-bold text-[#eebd90]">38/38</span>
                  <span className="block text-[10px] text-[#c8c6c5]">CBYDP Sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Authentication Form */}
          <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-center bg-white">
            {/* Header */}
            <div className="pb-5 mb-5 border-b border-[#efedf0]">
              <h2 className="font-['Poppins'] text-2xl font-bold text-[#0e0f0f] tracking-tight">
                Portal Authentication
              </h2>
              <p className="text-xs text-[#43474d] mt-1">
                Opisyal na pag-login para sa mga lider ng Sangguniang Kabataan
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#1b1c1e] uppercase tracking-wide">
                    Official Email / Username o SK ID
                  </label>
                  <span className="text-[11px] text-[#74777e]">
                    Format: TG-SK-2025-XXXX o email
                  </span>
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

              {/* Barangay Jurisdiction */}
              <div>
                <label className="block text-xs font-bold text-[#1b1c1e] uppercase tracking-wide mb-1.5">
                  Barangay Jurisdiction (Taguig City)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777e]">
                    <span className="material-symbols-outlined text-[18px]">location_city</span>
                  </div>
                  <select
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    className="w-full h-11 pl-11 pr-10 bg-white text-[#1b1c1e] text-sm rounded-lg border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00] transition-all appearance-none cursor-pointer shadow-sm"
                  >
                    <optgroup label="District 1">
                      <option value="Bagumbayan">Bagumbayan</option>
                      <option value="Bambang">Bambang</option>
                      <option value="Calzada">Calzada</option>
                      <option value="Hagonoy">Hagonoy</option>
                      <option value="Ibayo-Tipas">Ibayo-Tipas</option>
                      <option value="Ligid-Tipas">Ligid-Tipas</option>
                      <option value="Lower Bicutan">Lower Bicutan</option>
                      <option value="New Lower Bicutan">New Lower Bicutan</option>
                      <option value="Napindan">Napindan</option>
                      <option value="Palingon">Palingon</option>
                      <option value="San Miguel">San Miguel</option>
                      <option value="Santa Ana">Santa Ana</option>
                      <option value="Tuktukan">Tuktukan</option>
                      <option value="Ususan">Ususan</option>
                      <option value="Wawa">Wawa</option>
                    </optgroup>
                    <optgroup label="District 2">
                      <option value="Central Bicutan">Central Bicutan</option>
                      <option value="Central Signal">Central Signal Village</option>
                      <option value="Fort Bonifacio">Fort Bonifacio</option>
                      <option value="Katuparan">Katuparan</option>
                      <option value="Maharlika">Maharlika Village</option>
                      <option value="North Daang Hari">North Daang Hari</option>
                      <option value="North Signal">North Signal Village</option>
                      <option value="Pinagsama">Pinagsama</option>
                      <option value="South Daang Hari">South Daang Hari</option>
                      <option value="South Signal">South Signal Village</option>
                      <option value="Tanyag">Tanyag</option>
                      <option value="Upper Bicutan">Upper Bicutan</option>
                      <option value="Western Bicutan">Western Bicutan</option>
                    </optgroup>
                    <optgroup label="EMBO Barangays">
                      <option value="Cembo">Cembo</option>
                      <option value="Comembo">Comembo</option>
                      <option value="East Rembo">East Rembo</option>
                      <option value="Pembo">Pembo</option>
                      <option value="Pitogo">Pitogo</option>
                      <option value="Post Proper Northside">Post Proper Northside</option>
                      <option value="Post Proper Southside">Post Proper Southside</option>
                      <option value="Rizal">Rizal</option>
                      <option value="South Cembo">South Cembo</option>
                      <option value="West Rembo">West Rembo</option>
                    </optgroup>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#74777e]">
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </div>
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
                  <span className="text-xs text-[#43474d]">Manatiling naka-login (8 oras)</span>
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
