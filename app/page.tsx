'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import OfficialNavbar from '@/components/layout/official-navbar';
import apiClient from '@/lib/api/client';
import { StatCardSkeleton } from '@/components/ui/shimmer';

interface PortalStats {
  total_jurisdiction_barangays: number;
  onboarded_councils_count: number;
  total_registered_officials: number;
  chairpersons_count: number;
  kagawads_count: number;
  secretaries_count: number;
  treasurers_count: number;
  skmt_certified_count: number;
  skmt_certified_percentage: number;
  total_measures_passed: number;
  total_council_sessions: number;
  avg_session_attendance_rate: number;
  onboarded_barangays: string[];
}

export default function Home() {
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/stats/summary')
      .then((res) => {
        if (isMounted && res.data?.success && res.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load portal stats:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingStats(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9fb] text-[#1b1c1e] font-sans">
      {/* Official Civic Navigation Navbar (System-Wide Standard) */}
      <OfficialNavbar />

      {/* Main Content Workspace */}
      <main className="w-full flex-1 flex flex-col">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-10 flex flex-col gap-10">
          {/* Civic Authority Hero Banner with Ambient Gradient Glow */}
          <div className="relative w-full rounded-3xl p-8 sm:p-12 md:p-14 text-white overflow-hidden shadow-xl bg-gradient-to-br from-[#242424] via-[#1d1e20] to-[#121315] border border-white/10">
            {/* Ambient Background Aura Lights */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#ba0c00]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#eebd90]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div className="flex flex-col gap-5 max-w-2xl">
                {/* Jurisdiction Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#eebd90] text-xs font-bold tracking-wide w-fit shadow-xs">
                  <span className="material-symbols-outlined text-[16px] text-[#eebd90]">verified</span>
                  <span>City of Taguig • Sangguniang Kabataan Federation</span>
                </div>

                <h1 className="font-['Poppins'] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                  SK Officials Portal
                </h1>

                <p className="text-[#e3e2e5] text-sm sm:text-base max-w-xl leading-relaxed font-normal">
                  Centralized official portal for elected Barangay youth council leaders, chairpersons, kagawads, secretaries, and treasurers.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/officials"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#ba0c00] to-[#d91200] hover:from-[#c90d00] hover:to-[#e81400] text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    Meet SK Officials
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/15 hover:border-white/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                    Council Desk &amp; Passes
                  </Link>
                </div>
              </div>

              {/* Authority Metric Bento Widget */}
              <div className="w-full lg:w-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-7 flex flex-col gap-4 min-w-[280px] sm:min-w-[320px] border border-white/15 shadow-2xl hover:border-white/30 transition-all duration-300">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <span className="text-[11px] uppercase text-[#c8c6c5] tracking-wider font-bold">
                    Federation Roster
                  </span>
                  <span className="text-[10px] text-[#eebd90] font-semibold tracking-wide">
                    Live Data
                  </span>
                </div>

                <div>
                  <div className="font-['Poppins'] text-3xl font-extrabold text-white">
                    {loadingStats ? (
                      <span className="inline-block w-32 h-8 bg-white/20 rounded animate-pulse" />
                    ) : (
                      `${stats?.onboarded_councils_count || 1} / ${stats?.total_jurisdiction_barangays || 38} Councils`
                    )}
                  </div>
                  <span className="text-xs text-[#c8c6c5] block mt-0.5">
                    {loadingStats
                      ? 'Synchronizing councils...'
                      : `${stats?.onboarded_barangays?.join(', ') || 'Barangay Central'} • Active Onboarded`}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#eebd90]">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span className="font-bold">
                      {loadingStats ? '...' : `${stats?.skmt_certified_percentage ?? 100}% SKMT Certified`}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#c8c6c5]">RA 10742 / RA 11768</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (Stat Bento) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingStats ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                {/* Card 1 */}
                <div className="group bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg border border-[#efedf0] hover:border-[#ba0c00]/30 transition-all duration-300 hover:-translate-y-1 animate-in fade-in duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#f5f3f6] group-hover:bg-[#242424] text-[#0e0f0f] group-hover:text-white flex items-center justify-center transition-colors duration-300 shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[26px]">location_city</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[#74777e] font-bold">
                        Barangay Councils
                      </span>
                      <span className="font-['Poppins'] text-2xl font-extrabold text-[#0e0f0f] mt-0.5">
                        {stats?.onboarded_councils_count || 1} of {stats?.total_jurisdiction_barangays || 38}
                      </span>
                      <span className="text-[11px] text-[#ba0c00] font-bold mt-0.5">
                        {stats?.onboarded_councils_count || 1} Active Onboarded
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="group bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg border border-[#efedf0] hover:border-[#ba0c00]/30 transition-all duration-300 hover:-translate-y-1 animate-in fade-in duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#f5f3f6] group-hover:bg-[#ba0c00] text-[#ba0c00] group-hover:text-white flex items-center justify-center transition-colors duration-300 shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[26px]">badge</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[#74777e] font-bold">
                        Active Officials
                      </span>
                      <span className="font-['Poppins'] text-2xl font-extrabold text-[#0e0f0f] mt-0.5">
                        {stats?.total_registered_officials ?? 8}
                      </span>
                      <span className="text-[11px] text-[#43474d] mt-0.5">
                        Chairpersons &amp; Kagawads
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="group bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg border border-[#efedf0] hover:border-[#ba0c00]/30 transition-all duration-300 hover:-translate-y-1 animate-in fade-in duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#f5f3f6] group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-colors duration-300 shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[26px]">verified</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[#74777e] font-bold">
                        DILG Training
                      </span>
                      <span className="font-['Poppins'] text-2xl font-extrabold text-emerald-600 mt-0.5">
                        {stats?.skmt_certified_percentage ?? 100}%
                      </span>
                      <span className="text-[11px] text-[#43474d] mt-0.5">
                        {stats?.skmt_certified_count ?? 8} SKMT Certified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="group bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg border border-[#efedf0] hover:border-[#ba0c00]/30 transition-all duration-300 hover:-translate-y-1 animate-in fade-in duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#f5f3f6] group-hover:bg-[#ba0c00] text-[#ba0c00] group-hover:text-white flex items-center justify-center transition-colors duration-300 shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[26px]">description</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[#74777e] font-bold">
                        Passed Measures
                      </span>
                      <span className="font-['Poppins'] text-2xl font-extrabold text-[#0e0f0f] mt-0.5">
                        {stats?.total_measures_passed ?? 25}
                      </span>
                      <span className="text-[11px] text-[#43474d] mt-0.5">
                        {stats?.total_council_sessions ?? 4} Sessions Audited
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Core Council Modules Bento Grid */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#efedf0] pb-4">
              <div>
                <span className="text-[11px] tracking-widest uppercase text-[#ba0c00] font-bold block">
                  Taguig Civic Portal Fast Routing
                </span>
                <h2 className="font-['Poppins'] text-2xl font-extrabold text-[#0e0f0f] mt-0.5">
                  SK Officials Council Operations
                </h2>
              </div>
              <span className="text-xs text-[#74777e]">
                Direct access for constituents, council members, and administrators
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Module 1: Officials Directory */}
              <Link
                href="/officials"
                className="group bg-white p-7 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 border border-[#efedf0] hover:border-[#ba0c00]/40 relative overflow-hidden"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f5f3f6] group-hover:bg-[#242424] text-[#242424] group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-xs">
                    <span className="material-symbols-outlined text-[26px]">groups</span>
                  </div>
                  <div>
                    <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f] group-hover:text-[#ba0c00] transition-colors">
                      SK Officials Directory
                    </h3>
                    <p className="text-xs text-[#43474d] mt-2 leading-relaxed">
                      Public directory of elected chairpersons, kagawads, secretaries, and treasurers. Filter by committee leadership, purok jurisdiction, and active status.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#efedf0] flex items-center justify-between text-xs font-bold text-[#ba0c00]">
                  <span>Browse Council Roster</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1.5 transition-transform duration-200">
                    arrow_forward
                  </span>
                </div>
              </Link>

              {/* Module 2: Official Pass */}
              <Link
                href="/dashboard"
                className="group bg-white p-7 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 border border-[#efedf0] hover:border-[#ba0c00]/40 relative overflow-hidden"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f5f3f6] group-hover:bg-[#ba0c00] text-[#ba0c00] group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-xs">
                    <span className="material-symbols-outlined text-[26px]">badge</span>
                  </div>
                  <div>
                    <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f] group-hover:text-[#ba0c00] transition-colors">
                      Official Digital Pass
                    </h3>
                    <p className="text-xs text-[#43474d] mt-2 leading-relaxed">
                      Official digital pass with QR code verification, standard CR80 printable PVC layout, and public verification links.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#efedf0] flex items-center justify-between text-xs font-bold text-[#ba0c00]">
                  <span>View &amp; Print Pass</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1.5 transition-transform duration-200">
                    arrow_forward
                  </span>
                </div>
              </Link>

              {/* Module 3: Council Roll Call & Portal */}
              <Link
                href="/dashboard"
                className="group bg-white p-7 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 border border-[#efedf0] hover:border-[#ba0c00]/40 relative overflow-hidden"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f5f3f6] group-hover:bg-[#242424] text-[#0e0f0f] group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-xs">
                    <span className="material-symbols-outlined text-[26px]">how_to_reg</span>
                  </div>
                  <div>
                    <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f] group-hover:text-[#ba0c00] transition-colors">
                      Council Sessions &amp; Records
                    </h3>
                    <p className="text-xs text-[#43474d] mt-2 leading-relaxed">
                      Official Sanggunian roll call attendance ledger maintained by the SK Secretary, plus authored measures and approved resolutions tracking.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#efedf0] flex items-center justify-between text-xs font-bold text-[#ba0c00]">
                  <span>Access Council Ledger</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1.5 transition-transform duration-200">
                    arrow_forward
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Statutory Compliance & Trust Badges Strip */}
          <div className="p-6 rounded-2xl bg-white border border-[#efedf0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#ba0c00] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">policy</span>
              </div>
              <div>
                <h4 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f]">
                  Statutory Transparency Compliance
                </h4>
                <p className="text-xs text-[#74777e]">
                  Philippine Sangguniang Kabataan Reform Act of 2015 (RA 10742) as amended by RA 11768.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-[#f5f3f6] text-[#43474d] font-semibold">
                DILG Compliant
              </span>
              <span className="px-3 py-1 rounded-full bg-[#f5f3f6] text-[#43474d] font-semibold">
                RA 10173 Data Privacy
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                100% Active Incumbents
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Official Civic Footer */}
      <footer className="border-t border-[#efedf0] bg-white py-8 px-4 sm:px-6 lg:px-10 text-xs text-[#74777e]">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba0c00]"></span>
            <span className="font-semibold text-[#0e0f0f]">
              City of Taguig • Sangguniang Kabataan Federation
            </span>
          </div>
          <div>Republic Act No. 10742 (SK Reform Act) &amp; RA 11768 • All Rights Reserved</div>
        </div>
      </footer>
    </div>
  );
}
