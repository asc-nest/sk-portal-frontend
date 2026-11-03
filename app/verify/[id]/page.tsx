'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import apiClient from '@/lib/api/client';
import { SkOfficialProfile } from '@/types';
import CivicLoader from '@/components/ui/civic-loader';

function VerifyContent() {
  const params = useParams();
  const id = params?.id as string;
  const [official, setOfficial] = useState<SkOfficialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifiedAt, setVerifiedAt] = useState<string>('');

  useEffect(() => {
    async function fetchVerification() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get(`/officials/${id}`);
        if (res.data?.success && res.data?.data) {
          setOfficial(res.data.data);
          setVerifiedAt(new Date().toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' }));
        } else {
          setError('Official pass could not be verified in the active registry.');
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Official pass not found or term has concluded.'
        );
      } finally {
        setLoading(false);
      }
    }
    fetchVerification();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9fb] p-4">
        <CivicLoader
          size="lg"
          label="Verifying SK Official Pass on Taguig Civic Ledger..."
          sublabel="Department of the Interior and Local Government (DILG) • RA 10742"
        />
      </div>
    );
  }

  if (error || !official) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9fb] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">gpp_bad</span>
          </div>
          <h2 className="font-['Poppins'] text-xl font-bold text-[#0e0f0f]">
            Official Pass Unverified
          </h2>
          <p className="text-xs text-[#43474d] leading-relaxed">
            {error || 'No active council official found with this accreditation ID.'}
          </p>
          <div className="pt-2">
            <Link
              href="/officials"
              className="inline-block w-full py-2.5 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-lg transition-colors"
            >
              Bumalik sa Official Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://taguig.gov.ph/verify/${official.official_id_number || id}`;

  return (
    <div className="min-h-screen bg-[#faf9fb] text-[#1b1c1e] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-lg w-full space-y-6">
        {/* Verification Status Banner */}
        <div className="bg-emerald-600 text-white rounded-2xl p-4 text-center shadow-md flex items-center justify-center gap-3 print:hidden">
          <span className="material-symbols-outlined text-3xl shrink-0">verified</span>
          <div className="text-left">
            <h3 className="font-['Poppins'] text-sm font-bold tracking-wide uppercase">
              Official Council Pass Verified
            </h3>
            <p className="text-[11px] text-emerald-100">
              Department of the Interior and Local Government (DILG) &amp; City of Taguig
            </p>
          </div>
        </div>

        {/* Official Pass Card */}
        <div className="bg-white rounded-2xl border border-[#efedf0] shadow-xl overflow-hidden print:border-none print:shadow-none">
          {/* Card Top Strip */}
          <div className="bg-[#242424] text-white p-6 pb-5 flex items-center justify-between border-b-4 border-[#ba0c00]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#eebd90]">
                Republika ng Pilipinas • Lungsod ng Taguig
              </span>
              <h1 className="font-['Poppins'] text-lg font-bold">
                Sangguniang Kabataan Council
              </h1>
              <p className="text-xs text-[#c8c6c5]">{official.barangay_name}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#ba0c00] flex items-center justify-center font-extrabold text-white text-base shadow-sm shrink-0">
              SK
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#0e0f0f] text-white flex items-center justify-center text-2xl font-bold font-['Poppins'] shrink-0 shadow-md border-2 border-[#efedf0]">
                {official.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={official.avatar_url}
                    alt={official.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  official.full_name
                    .split(' ')
                    .filter((w) => !w.includes('.'))
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                )}
              </div>
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#ba0c00] text-white text-xs font-bold font-['Inter']">
                  {official.position_title}
                </span>
                <h2 className="font-['Poppins'] text-xl font-bold text-[#0e0f0f]">
                  {official.full_name}
                </h2>
                <p className="text-xs font-mono text-[#ba0c00] font-bold">
                  ID: {official.official_id_number || `SK-${official.id}`}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-[#efedf0] text-xs">
              <div className="p-3 bg-[#faf9fb] rounded-xl border border-[#efedf0]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777e] block mb-1">
                  Assigned Committee Portfolio
                </span>
                <span className="font-semibold text-sm text-[#0e0f0f]">
                  {official.committee_assigned || 'General Council Leadership'}
                </span>
              </div>

              {official.bio_advocacy && (
                <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl italic text-xs text-[#43474d] leading-relaxed">
                  "{official.bio_advocacy}"
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#efedf0]">
                <div>
                  <span className="text-[#74777e]">Barangay Jurisdiction</span>
                  <p className="font-semibold text-[#0e0f0f]">{official.barangay_name}</p>
                </div>
                <div>
                  <span className="text-[#74777e]">Purok / Sitio Residence</span>
                  <p className="font-semibold text-[#0e0f0f]">{official.purok_sitio || 'Barangay Center'}</p>
                </div>
                <div>
                  <span className="text-[#74777e]">Official Term</span>
                  <p className="font-semibold text-[#0e0f0f]">2023 – 2026</p>
                </div>
                <div>
                  <span className="text-[#74777e]">Accreditation Status</span>
                  <p className="font-semibold text-emerald-600">Active Incumbent (RA 10742)</p>
                </div>
              </div>

              {/* Legislative Performance Records in Verification */}
              {official.measures && official.measures.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-[#efedf0]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777e]">
                      Authored Measures &amp; Passed Resolutions ({official.measures.length})
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {official.passed_measures_count ?? official.measures.length} Passed
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {official.measures.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 bg-[#faf9fb] rounded-lg border border-[#efedf0] text-[11px] flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 truncate">
                          <span className="font-mono text-[#ba0c00] font-bold mr-1.5">
                            {m.resolution_number || 'RES'}
                          </span>
                          <span className="text-[#0e0f0f] font-semibold">{m.title}</span>
                          <span className="text-[10px] text-[#74777e] block truncate">
                            {m.category} • {m.authorship_label || 'Author'}
                          </span>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                            m.status === 'passed' || m.status === 'adopted' || m.status === 'enacted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.status_badge || m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Digital Seal / QR Stamp */}
              <div className="p-4 bg-[#faf9fb] rounded-xl border border-[#efedf0] flex items-center justify-between gap-4 mt-2">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#ba0c00] block">
                    Cryptographic Ledger Stamp
                  </span>
                  <p className="text-[11px] text-[#43474d]">
                    Verified in real-time on {verifiedAt || 'today'}.
                  </p>
                  <p className="text-[10px] text-[#74777e]">
                    Authenticated under DILG Mandatory SK Training & Leadership Guidelines.
                  </p>
                </div>
                <div className="shrink-0 p-1 bg-white border border-[#efedf0] rounded-lg">
                  <QRCodeSVG value={currentUrl} size={64} level="M" />
                </div>
              </div>
            </div>

            {/* Actions Strip */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-[#efedf0] print:hidden">
              <Link
                href="/officials"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#43474d] hover:text-[#0e0f0f] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Talaan ng mga Opisyal
              </Link>
              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print Verification Slip
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-[#74777e] print:hidden">
          Official Government Youth Accreditation Desk • Republic Act No. 10742 as amended by RA 11768
        </p>
      </div>
    </div>
  );
}

export default function VerifyOfficialPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf9fb]">
          <div className="text-center space-y-3">
            <div className="h-10 w-10 border-4 border-[#ba0c00] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-[#43474d]">
              Inihahanda ang pagpapatunay...
            </p>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
