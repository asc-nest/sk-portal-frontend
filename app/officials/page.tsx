'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { SkOfficialProfile } from '@/types';
import OfficialNavbar from '@/components/layout/official-navbar';
import { OfficialCardSkeleton } from '@/components/ui/shimmer';

export default function OfficialsDirectoryPage() {
  const [officials, setOfficials] = useState<SkOfficialProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [committeeFilter, setCommitteeFilter] = useState('all');
  const [selectedOfficial, setSelectedOfficial] = useState<SkOfficialProfile | null>(null);

  useEffect(() => {
    async function fetchOfficials() {
      try {
        setLoading(true);
        const res = await apiClient.get('/officials');
        if (res.data?.data) {
          setOfficials(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching officials:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOfficials();
  }, []);

  // Distinct list of committees for filter pills
  const committeesList = useMemo(() => {
    const list = new Set<string>();
    officials.forEach((o) => {
      if (o.committee_assigned) {
        list.add(o.committee_assigned);
      }
    });
    return Array.from(list);
  }, [officials]);

  const filteredOfficials = useMemo(() => {
    return officials.filter((official) => {
      const matchesSearch =
        official.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        official.committee_assigned?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        official.barangay_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        official.purok_sitio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        official.official_id_number?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === 'all' ||
        official.position === roleFilter ||
        (roleFilter === 'Councilor' && official.position === 'kagawad') ||
        (roleFilter === 'Chairperson' && official.position === 'chairperson') ||
        (roleFilter === 'Secretary' && official.position === 'secretary') ||
        (roleFilter === 'Treasurer' && official.position === 'treasurer');

      const matchesCommittee =
        committeeFilter === 'all' ||
        (official.committee_assigned &&
          official.committee_assigned.toLowerCase().includes(committeeFilter.toLowerCase()));

      return matchesSearch && matchesRole && matchesCommittee;
    });
  }, [officials, searchTerm, roleFilter, committeeFilter]);

  // Executive board (Federation leaders)
  const executiveOfficers = useMemo(() => {
    return officials.slice(0, 4);
  }, [officials]);

  return (
    <div className="min-h-screen bg-[#faf9fb] text-[#1b1c1e] flex flex-col font-sans">
      {/* Official Civic Navigation Navbar */}
      <OfficialNavbar />

      {/* Main Body */}
      <main className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 flex-1 flex flex-col gap-8">
        {/* Page Title & Intro */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#efedf0]">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-[#ba0c00] uppercase tracking-wider">
              City of Taguig • Republic Act No. 10742 / RA 11768
            </span>
            <h1 className="font-['Poppins'] text-3xl font-extrabold text-[#0e0f0f] tracking-tight mt-1">
              SK Officials Directory
            </h1>
            <p className="text-sm text-[#43474d] mt-2 leading-relaxed">
              Official public roster of accredited Sangguniang Kabataan youth officials. Constituents, barangay stakeholders, and partner organizations can inspect active terms, assigned committee portfolios, and verify official council passes in real-time.
            </p>
          </div>
        </section>

        {/* Executive Leadership Showcase */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-['Poppins'] text-xl font-bold text-[#0e0f0f]">
                Executive Council Officers
              </h2>
              <p className="text-xs text-[#43474d]">
                Barangay youth council leadership and executive board
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {executiveOfficers.map((official, idx) => {
              const roleTitle = official.position_title || 'SK Official';
              const isLead = idx === 0;

              return (
                <div
                  key={official.id}
                  className="bg-white rounded-xl p-5 shadow-sm border border-[#efedf0] flex flex-col justify-between hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="w-full h-40 rounded-lg overflow-hidden bg-gradient-to-tr from-[#242424] to-[#43474d] flex items-center justify-center text-white text-3xl font-bold mb-4 font-['Poppins'] shadow-sm relative group">
                      {official.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={official.avatar_url}
                          alt={official.full_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-bold rounded inline-block mb-1.5 ${
                        isLead
                          ? 'bg-[#ba0c00] text-white'
                          : 'bg-[#efedf0] text-[#0e0f0f]'
                      }`}
                    >
                      {roleTitle}
                    </span>

                    <h3 className="font-['Poppins'] text-base font-bold text-[#0e0f0f] leading-tight">
                      {official.full_name}
                    </h3>
                    <p className="text-xs text-[#43474d] mt-1">
                      {official.barangay_name} • {official.purok_sitio || 'Barangay Center'}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedOfficial(official)}
                    className="w-full mt-4 py-2 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">badge</span>
                    View Dossier
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Filter and Search Bar */}
        <section className="bg-white rounded-xl shadow-sm border border-[#efedf0] p-4 sm:p-5 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74777e] text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search official by name, committee, purok, or Pass ID (e.g. SK-2023-001)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-[#f5f3f6] rounded-lg text-sm text-[#1b1c1e] placeholder:text-[#74777e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#242424] transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#f5f3f6] px-3 py-1.5 rounded-lg">
                <span className="text-xs text-[#74777e] font-semibold">Position:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#0e0f0f] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Positions</option>
                  <option value="Chairperson">SK Chairperson</option>
                  <option value="Councilor">SK Kagawad / Councilor</option>
                  <option value="Secretary">SK Secretary</option>
                  <option value="Treasurer">SK Treasurer</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setCommitteeFilter('all');
                }}
                className="p-2.5 bg-[#efedf0] hover:bg-[#e9e8ea] rounded-lg text-[#43474d] hover:text-[#0e0f0f] transition-colors"
                title="Reset Filters"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
              </button>
            </div>
          </div>

          {/* Committee Filter Pills */}
          {committeesList.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
              <span className="text-[#74777e] font-semibold whitespace-nowrap mr-1">
                Committees:
              </span>
              <button
                onClick={() => setCommitteeFilter('all')}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                  committeeFilter === 'all'
                    ? 'bg-[#ba0c00] text-white'
                    : 'bg-[#f5f3f6] text-[#43474d] hover:bg-[#efedf0]'
                }`}
              >
                All Committees
              </button>
              {committeesList.map((c) => (
                <button
                  key={c}
                  onClick={() => setCommitteeFilter(c)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                    committeeFilter === c
                      ? 'bg-[#ba0c00] text-white'
                      : 'bg-[#f5f3f6] text-[#43474d] hover:bg-[#efedf0]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Accredited Council Roster Grid */}
        <section className="pb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f]">
                Accredited Council Roster
              </h2>
              <p className="text-xs text-[#43474d]">
                Showing {filteredOfficials.length} active verified youth officials
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <OfficialCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredOfficials.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#efedf0] p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-[#74777e] mb-2">person_search</span>
              <h3 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">Walang Natagpuang Opisyal</h3>
              <p className="text-xs text-[#74777e] mt-1">Subukang baguhin ang search query o filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOfficials.map((official) => {
                const initials = official.full_name
                  .split(' ')
                  .filter((w) => !w.includes('.'))
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('');

                return (
                  <div
                    key={official.id}
                    className="bg-white rounded-xl p-5 shadow-sm border border-[#efedf0] flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#242424] text-white flex items-center justify-center font-bold text-sm font-['Poppins'] shadow-sm shrink-0 border border-[#efedf0]">
                            {official.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={official.avatar_url}
                                alt={official.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <h3 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f]">
                              {official.full_name}
                            </h3>
                            <span className="inline-block mt-0.5 text-[11px] font-bold px-2 py-0.5 bg-[#f5f3f6] text-[#0e0f0f] rounded">
                              {official.position_title}
                            </span>
                          </div>
                        </div>

                        {official.official_id_number && (
                          <span className="font-mono text-[10px] text-[#ba0c00] font-bold bg-[#ba0c00]/5 px-2 py-0.5 rounded border border-[#ba0c00]/20">
                            {official.official_id_number}
                          </span>
                        )}
                      </div>

                      {official.committee_assigned && (
                        <div className="mt-4 p-2.5 bg-[#faf9fb] rounded-lg border border-[#efedf0] text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777e] block">
                            Assigned Committee
                          </span>
                          <span className="font-medium text-[#1b1c1e] line-clamp-1">
                            {official.committee_assigned}
                          </span>
                        </div>
                      )}

                      {official.bio_advocacy && (
                        <div className="mt-3 pl-3 border-l-2 border-[#ba0c00] text-xs text-[#43474d] italic line-clamp-2">
                          "{official.bio_advocacy}"
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#efedf0] flex items-center justify-between text-xs text-[#43474d]">
                      <span>{official.purok_sitio || official.barangay_name}</span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/verify/${official.official_id_number || official.id}`}
                          target="_blank"
                          className="text-xs font-semibold text-[#74777e] hover:text-[#ba0c00] flex items-center gap-0.5"
                          title="Open Verified Official Pass"
                        >
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          Pass
                        </Link>
                        <button
                          onClick={() => setSelectedOfficial(official)}
                          className="text-xs font-bold text-[#ba0c00] hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          Dossier
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modal Profile Dossier View */}
      {selectedOfficial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#efedf0] space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#242424] text-white flex items-center justify-center font-bold text-lg font-['Poppins'] shadow-md border-2 border-[#efedf0] shrink-0">
                  {selectedOfficial.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedOfficial.avatar_url}
                      alt={selectedOfficial.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedOfficial.full_name
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')
                  )}
                </div>
                <div>
                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 bg-[#ba0c00] text-white rounded mb-1">
                    {selectedOfficial.position_title}
                  </span>
                  <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f] leading-snug">
                    {selectedOfficial.full_name}
                  </h3>
                  <p className="text-xs text-[#74777e]">
                    {selectedOfficial.barangay_name} • {selectedOfficial.purok_sitio || 'Barangay Center'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOfficial(null)}
                className="text-[#74777e] hover:text-[#0e0f0f] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-[#faf9fb] rounded-xl border border-[#efedf0]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777e] block mb-1">
                  Assigned Committee Portfolio
                </span>
                <span className="font-semibold text-sm text-[#0e0f0f]">
                  {selectedOfficial.committee_assigned || 'General SK Council Leadership'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777e] block mb-1">
                  Youth Advocacy &amp; Leadership Statement
                </span>
                <p className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-xs italic text-[#43474d] leading-relaxed">
                  "{selectedOfficial.bio_advocacy || 'Committed to transparent and proactive youth leadership in the City of Taguig.'}"
                </p>
              </div>

              {/* Authored Measures Showcase in Public Dossier */}
              {selectedOfficial.measures && selectedOfficial.measures.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777e]">
                      Authored Measures &amp; Resolutions ({selectedOfficial.measures.length})
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {selectedOfficial.passed_measures_count || selectedOfficial.measures.length} Passed
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedOfficial.measures.map((m) => (
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

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#efedf0]">
                <div>
                  <span className="text-[#74777e]">Barangay Jurisdiction</span>
                  <p className="font-semibold text-[#0e0f0f]">{selectedOfficial.barangay_name}</p>
                </div>
                <div>
                  <span className="text-[#74777e]">Official Pass ID</span>
                  <p className="font-mono font-bold text-[#ba0c00]">{selectedOfficial.official_id_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[#74777e]">Term Status</span>
                  <p className="font-semibold text-emerald-600">Active Incumbent (2023–2026)</p>
                </div>
                <div>
                  <span className="text-[#74777e]">Accreditation Seal</span>
                  <p className="font-semibold text-[#0e0f0f]">RA 10742 / DILG Certified</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Link
                href={`/verify/${selectedOfficial.official_id_number || selectedOfficial.id}`}
                target="_blank"
                className="flex-1 py-2.5 bg-[#ba0c00] hover:bg-[#e81100] text-white text-xs font-bold rounded-lg transition-colors text-center inline-flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Suriin ang Opisyal na Pass
              </Link>
              <button
                onClick={() => setSelectedOfficial(null)}
                className="px-4 py-2.5 bg-[#efedf0] hover:bg-[#e9e8ea] text-[#1b1c1e] text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Isara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}