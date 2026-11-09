'use client';

/**
 * ARCHIVED FEATURE: Council Sessions & Roll Call Ledger (Item 2-A)
 * Set aside per user instruction: Focus portal on User Profile & SK Officials Dashboard.
 * This component preserves all logic, UI, and API integrations for session roll-call recording,
 * attendance calculation, and journal history so it can be restored whenever needed.
 */

import React, { useState } from 'react';
import apiClient from '@/lib/api/client';
import { CouncilSession, SessionAttendanceStatus, SkOfficialProfile } from '@/types';

interface SessionRollCallArchiveProps {
  councilOfficials: SkOfficialProfile[];
  profile: SkOfficialProfile | null;
  sessionAttendance: number;
  setSessionAttendance: (rate: number) => void;
  setProfile: (prof: SkOfficialProfile) => void;
  isSecretaryOrChairOrAdmin: boolean;
}

export default function SessionRollCallArchive({
  councilOfficials,
  profile,
  sessionAttendance,
  setSessionAttendance,
  setProfile,
  isSecretaryOrChairOrAdmin,
}: SessionRollCallArchiveProps) {
  const [sessions, setSessions] = useState<CouncilSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionNumber, setSessionNumber] = useState('');
  const [sessionType, setSessionType] = useState<'regular' | 'special'>('regular');
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sessionVenue, setSessionVenue] = useState('Barangay Session Hall');
  const [sessionPresidedBy, setSessionPresidedBy] = useState('Hon. SK Chairperson');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRollCall, setSessionRollCall] = useState<Record<number, { status: SessionAttendanceStatus; remarks: string }>>({});
  const [sessionSubmitting, setSessionSubmitting] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const res = await apiClient.get('/sessions');
      if (res.data?.data) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error('Sessions fetch error', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleOpenCreateSession = () => {
    const initialRoll: Record<number, { status: SessionAttendanceStatus; remarks: string }> = {};
    councilOfficials.forEach((o) => {
      initialRoll[o.id] = { status: 'present', remarks: '' };
    });
    setSessionRollCall(initialRoll);
    const count = sessions.length + 1;
    setSessionNumber(`RS-${new Date().getFullYear()}-${String(count).padStart(2, '0')}`);
    setSessionTitle(`${count}${getOrdinal(count)} Regular Sanggunian Session`);
    setSessionVenue('Barangay Central Session Hall');
    setSessionPresidedBy('Hon. John Patrick Santos');
    setSessionNotes('');
    setSessionError(null);
    setShowCreateSessionModal(true);
  };

  const handleSubmitSessionRollCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim() || !sessionNumber.trim()) {
      setSessionError('Session title and session number are required.');
      return;
    }

    const attendances = Object.entries(sessionRollCall).map(([profileId, data]) => ({
      official_profile_id: Number(profileId),
      status: data.status,
      remarks: data.remarks || undefined,
    }));

    if (attendances.length === 0) {
      setSessionError('Please record roll call attendance for at least one official.');
      return;
    }

    try {
      setSessionSubmitting(true);
      setSessionError(null);
      const res = await apiClient.post('/sessions', {
        session_title: sessionTitle,
        session_number: sessionNumber,
        session_type: sessionType,
        session_date: sessionDate,
        venue: sessionVenue,
        presided_by: sessionPresidedBy,
        notes: sessionNotes || undefined,
        attendances,
      });

      if (res.data?.success) {
        await loadSessions();
        const profRes = await apiClient.get('/profile');
        if (profRes.data?.data?.profile) {
          setProfile(profRes.data.data.profile);
          setSessionAttendance(profRes.data.data.profile.session_attendance_rate);
        }
        setShowCreateSessionModal(false);
      }
    } catch (err: any) {
      setSessionError(err.response?.data?.message || 'Failed to submit council session roll call.');
    } finally {
      setSessionSubmitting(false);
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (!confirm('Are you sure you want to delete this session and recalculate roll call attendance rates?')) return;
    try {
      const res = await apiClient.delete(`/sessions/${id}`);
      if (res.data?.success) {
        await loadSessions();
        const profRes = await apiClient.get('/profile');
        if (profRes.data?.data?.profile) {
          setProfile(profRes.data.data.profile);
          setSessionAttendance(profRes.data.data.profile.session_attendance_rate);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete session.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#efedf0] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#ba0c00] uppercase tracking-wider">
                Sangguniang Kabataan Session Ledger
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#ba0c00]">
                RA 10742 / RA 11768 Compliant
              </span>
            </div>
            <h2 className="font-['Poppins'] text-2xl font-extrabold text-[#0e0f0f] mt-1">
              Council Session Roll Call Journal
            </h2>
            <p className="text-xs text-[#74777e] mt-1">
              Official attendance records maintained by the SK Secretary. Directly authenticates official attendance rates for all 8 council members.
            </p>
          </div>

          {isSecretaryOrChairOrAdmin && (
            <button
              onClick={handleOpenCreateSession}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#ba0c00] hover:bg-[#e81100] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">post_add</span>
              Record Session Roll Call
            </button>
          )}
        </div>

        {/* Sessions Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0]">
            <span className="text-[10px] font-bold text-[#74777e] uppercase tracking-wider block mb-1">
              Total Sessions Convened
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Poppins'] text-2xl font-bold text-[#0e0f0f]">
                {sessions.length}
              </span>
              <span className="text-xs text-[#74777e]">Recorded Assemblies</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0]">
            <span className="text-[10px] font-bold text-[#74777e] uppercase tracking-wider block mb-1">
              Your Official Attendance Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Poppins'] text-2xl font-bold text-[#ba0c00]">
                {profile?.session_attendance_rate ?? sessionAttendance}%
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Active Quorum Member</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0]">
            <span className="text-[10px] font-bold text-[#74777e] uppercase tracking-wider block mb-1">
              Statutory Quorum Rule
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Poppins'] text-xl font-bold text-emerald-600">
                5 of 8 Present
              </span>
              <span className="text-xs text-[#74777e]">Majority Rule</span>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="mt-8 space-y-4">
          <h3 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
            Historical Sanggunian Session Ledger
          </h3>

          {sessionsLoading ? (
            <div className="py-12 text-center text-xs text-[#74777e]">
              Kinakarga ang mga talaan ng sesyon...
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-[#efedf0] rounded-xl">
              <span className="material-symbols-outlined text-4xl text-[#c4c6ce]">how_to_reg</span>
              <p className="font-['Poppins'] text-sm font-bold text-[#0e0f0f] mt-2">
                Walang Nakatalang Sesyon Pa
              </p>
              <p className="text-xs text-[#74777e] mt-1 max-w-md mx-auto">
                Ang Kalihim ng SK (Secretary) ay maaaring mag-tala ng Roll Call Attendance para sa mga regular o espesyal na sesyon ng Sanggunian.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const isExpanded = expandedSessionId === s.id;
                const dateObj = new Date(s.session_date);
                const formattedDate = dateObj.toLocaleDateString('fil-PH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={s.id}
                    className="border border-[#efedf0] rounded-xl overflow-hidden hover:border-[#ba0c00]/30 transition-all bg-white"
                  >
                    <div
                      onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#faf9fb] select-none"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-[#ba0c00] flex items-center justify-center font-bold text-sm font-mono shrink-0">
                          {s.session_number.split('-').pop() || s.id}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f]">
                              {s.session_title}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                s.session_type === 'regular'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-purple-50 text-purple-700'
                              }`}
                            >
                              {s.session_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#74777e] mt-1">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                              {formattedDate}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              {s.venue}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="material-symbols-outlined text-gray-400">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-[#efedf0] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#efedf0]">
              <h3 className="font-['Poppins'] text-xl font-bold text-[#0e0f0f]">
                Record Sanggunian Session &amp; Roll Call
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateSessionModal(false)}
                className="text-[#74777e] hover:text-[#0e0f0f] font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sessionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                {sessionError}
              </div>
            )}

            <form onSubmit={handleSubmitSessionRollCall} className="space-y-4">
              <div className="flex justify-end gap-2 pt-4 border-t border-[#efedf0]">
                <button
                  type="button"
                  onClick={() => setShowCreateSessionModal(false)}
                  className="px-4 py-2.5 bg-[#efedf0] hover:bg-[#e9e8ea] text-[#1b1c1e] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sessionSubmitting}
                  className="px-5 py-2.5 bg-[#ba0c00] hover:bg-[#e81100] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  {sessionSubmitting ? 'Certifying...' : 'Submit & Certify Roll Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

