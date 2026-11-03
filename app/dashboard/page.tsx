'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import apiClient from '@/lib/api/client';
import OfficialNavbar from '@/components/layout/official-navbar';
import CivicLoader from '@/components/ui/civic-loader';
import {
  User,
  SkOfficialProfile,
  OfficialMeasure,
  CouncilSession,
  SessionAttendance,
  AuthorshipRole,
  MeasureStatus,
  SessionAttendanceStatus,
} from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SkOfficialProfile | null>(null);
  const [councilOfficials, setCouncilOfficials] = useState<SkOfficialProfile[]>([]);
  const [councilLoading, setCouncilLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pass' | 'edit' | 'council' | 'sessions' | 'invite'>('pass');

  // Measures State (Item 1)
  const [measures, setMeasures] = useState<OfficialMeasure[]>([]);
  const [measuresLoading, setMeasuresLoading] = useState(false);
  const [showAddMeasureModal, setShowAddMeasureModal] = useState(false);
  const [measureTitle, setMeasureTitle] = useState('');
  const [measureResNo, setMeasureResNo] = useState('');
  const [measureCategory, setMeasureCategory] = useState('Youth Empowerment');
  const [measureRole, setMeasureRole] = useState<AuthorshipRole>('principal_author');
  const [measureStatus, setMeasureStatus] = useState<MeasureStatus>('passed');
  const [measureDate, setMeasureDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [measureSummary, setMeasureSummary] = useState('');
  const [measureSubmitting, setMeasureSubmitting] = useState(false);
  const [measureError, setMeasureError] = useState<string | null>(null);

  // Council Sessions & Roll Call Ledger State (Item 2-A)
  const [sessions, setSessions] = useState<CouncilSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionNumber, setSessionNumber] = useState('');
  const [sessionType, setSessionType] = useState<'regular' | 'special'>('regular');
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sessionVenue, setSessionVenue] = useState('Barangay Central Session Hall');
  const [sessionPresidedBy, setSessionPresidedBy] = useState('Hon. John Patrick Santos');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRollCall, setSessionRollCall] = useState<Record<number, { status: SessionAttendanceStatus; remarks: string }>>({});
  const [sessionSubmitting, setSessionSubmitting] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);

  // Profile Edit State
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [bioAdvocacy, setBioAdvocacy] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [nickname, setNickname] = useState('');
  const [purokSitio, setPurokSitio] = useState('');
  const [passedMeasures, setPassedMeasures] = useState<number>(14);
  const [sessionAttendance, setSessionAttendance] = useState<number>(98.6);
  const [skmtCompliant, setSkmtCompliant] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Avatar Upload State
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // PVC ID Modal State
  const [showPvcModal, setShowPvcModal] = useState(false);

  // Invite Generator State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [invitePosition, setInvitePosition] = useState<'chairperson' | 'kagawad' | 'secretary' | 'treasurer'>('kagawad');
  const [inviteCommittee, setInviteCommittee] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const token = localStorage.getItem('sk_token');
        const expiry = localStorage.getItem('sk_session_expires_at');
        if (!token || (expiry && Date.now() > Number(expiry))) {
          localStorage.removeItem('sk_token');
          localStorage.removeItem('sk_user');
          localStorage.removeItem('sk_session_expires_at');
          window.dispatchEvent(new Event('sk_auth_changed'));
          router.push('/login');
          return;
        }

        const meRes = await apiClient.get('/auth/me');
        if (meRes.data?.data) {
          const userData = meRes.data.data.user || meRes.data.data;
          setUser(userData);

          try {
            const profileRes = await apiClient.get('/profile');
            if (profileRes.data?.data?.profile) {
              const prof: SkOfficialProfile = profileRes.data.data.profile;
              setProfile(prof);
              setFirstName(prof.first_name || '');
              setMiddleName(prof.middle_name || '');
              setLastName(prof.last_name || '');
              setSuffix(prof.suffix || '');
              setGender(prof.gender || 'male');
              setBioAdvocacy(prof.bio_advocacy || '');
              setContactNumber(prof.contact_number || '');
              setNickname(prof.nickname || '');
              setPurokSitio(prof.purok_sitio || '');
              setPassedMeasures(prof.passed_measures_count ?? 14);
              setSessionAttendance(prof.session_attendance_rate ?? 98.6);
              setSkmtCompliant(prof.skmt_compliant ?? true);
              if (prof.measures) {
                setMeasures(prof.measures);
              }
            }
          } catch (e) {
            console.warn('Profile fetch note:', e);
          }
        }
      } catch (err) {
        console.error('Session load error', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [router]);

  // Load measures from API
  const loadMeasures = async () => {
    try {
      setMeasuresLoading(true);
      const res = await apiClient.get('/profile/measures');
      if (res.data?.data?.measures) {
        setMeasures(res.data.data.measures);
        if (typeof res.data.data.passed_count === 'number') {
          setPassedMeasures(res.data.data.passed_count);
        }
      }
    } catch (err) {
      console.error('Measures fetch error', err);
    } finally {
      setMeasuresLoading(false);
    }
  };

  // Load council sessions from API
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

  // Fetch council roster and sessions when tabs are opened
  useEffect(() => {
    if ((activeTab === 'council' || activeTab === 'sessions') && councilOfficials.length === 0) {
      async function loadCouncil() {
        try {
          setCouncilLoading(true);
          const res = await apiClient.get('/officials');
          if (res.data?.data) {
            setCouncilOfficials(res.data.data);
          }
        } catch (err) {
          console.error('Council fetch error', err);
        } finally {
          setCouncilLoading(false);
        }
      }
      loadCouncil();
    }

    if (activeTab === 'sessions') {
      loadSessions();
    }
  }, [activeTab, councilOfficials.length]);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('sk_token');
      localStorage.removeItem('sk_user');
      localStorage.removeItem('sk_session_expires_at');
      window.dispatchEvent(new Event('sk_auth_changed'));
      router.push('/login');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      setSaveSuccess(null);
      const res = await apiClient.put('/profile', {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix: suffix,
        gender: gender,
        bio_advocacy: bioAdvocacy,
        contact_number: contactNumber,
        nickname: nickname,
        purok_sitio: purokSitio,
        passed_measures_count: Number(passedMeasures) || 0,
        session_attendance_rate: Number(sessionAttendance) || 0,
        skmt_compliant: Boolean(skmtCompliant),
      });

      if (res.data?.success) {
        const updated = res.data.data;
        setProfile(updated);
        try {
          const stored = localStorage.getItem('sk_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.name = updated.full_name;
            parsed.profile = updated;
            localStorage.setItem('sk_user', JSON.stringify(parsed));
            window.dispatchEvent(new Event('sk_auth_changed'));
          }
        } catch {
          // ignore
        }
        setSaveSuccess('Ang inyong profile at impormasyon ay matagumpay na na-update.');
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } catch (err: any) {
      console.error('Save error:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Ang file ay lumampas sa 2MB limit (JPEG/PNG/WebP lamang).');
      return;
    }

    try {
      setAvatarLoading(true);
      setAvatarError(null);
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await apiClient.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.data?.avatar_url) {
        setProfile((prev) => (prev ? { ...prev, avatar_url: res.data.data.avatar_url } : null));
        try {
          const stored = localStorage.getItem('sk_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.profile) parsed.profile.avatar_url = res.data.data.avatar_url;
            localStorage.setItem('sk_user', JSON.stringify(parsed));
            window.dispatchEvent(new Event('sk_auth_changed'));
          }
        } catch {
          // ignore
        }
        setSaveSuccess('Matagumpay na na-upload ang inyong official portrait.');
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } catch (err: any) {
      setAvatarError(err.response?.data?.message || 'Bigo ang pag-upload ng avatar image.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setGeneratedInviteUrl(null);
    setCopied(false);

    try {
      setInviteLoading(true);
      const res = await apiClient.post('/invitations/generate', {
        email: inviteEmail,
        first_name: inviteFirstName,
        last_name: inviteLastName,
        position: invitePosition,
        committee_assigned: inviteCommittee,
      });

      if (res.data?.success && res.data?.data?.invite_url) {
        setGeneratedInviteUrl(res.data.data.invite_url);
        setInviteEmail('');
        setInviteFirstName('');
        setInviteLastName('');
        setInviteCommittee('');
      }
    } catch (err: any) {
      setInviteError(err.response?.data?.message || 'Failed to generate invitation link.');
    } finally {
      setInviteLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // --- Measures Handlers (Item 1) ---
  const handleCreateMeasure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!measureTitle.trim()) {
      setMeasureError('Title is required');
      return;
    }

    try {
      setMeasureSubmitting(true);
      setMeasureError(null);
      const res = await apiClient.post('/profile/measures', {
        title: measureTitle,
        resolution_number: measureResNo || undefined,
        category: measureCategory,
        authorship_role: measureRole,
        status: measureStatus,
        date_approved: measureDate || undefined,
        summary: measureSummary || undefined,
      });

      if (res.data?.success) {
        await loadMeasures();
        setShowAddMeasureModal(false);
        setMeasureTitle('');
        setMeasureResNo('');
        setMeasureSummary('');
      }
    } catch (err: any) {
      setMeasureError(err.response?.data?.message || 'Failed to record legislative measure.');
    } finally {
      setMeasureSubmitting(false);
    }
  };

  const handleDeleteMeasure = async (id: number) => {
    if (!confirm('Are you sure you want to remove this legislative record?')) return;
    try {
      const res = await apiClient.delete(`/profile/measures/${id}`);
      if (res.data?.success) {
        await loadMeasures();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete legislative measure.');
    }
  };

  // --- Session Roll Call Handlers (Item 2-A) ---
  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const handleOpenCreateSession = async () => {
    let officialsList = councilOfficials;
    if (officialsList.length === 0) {
      try {
        const res = await apiClient.get('/officials');
        if (res.data?.data) {
          officialsList = res.data.data;
          setCouncilOfficials(officialsList);
        }
      } catch (e) {
        console.error(e);
      }
    }

    const initialRoll: Record<number, { status: SessionAttendanceStatus; remarks: string }> = {};
    officialsList.forEach((o) => {
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
        // Refresh own profile to reflect updated attendance rate
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

  const userRoles: string[] = user?.roles || (user as any)?.user?.roles || [];
  const isChairOrAdmin =
    userRoles.some((r) => ['super_admin', 'sk_chairperson', 'chairperson', 'admin'].includes(r)) ||
    user?.username === 'superadmin' ||
    user?.username === 'jpsantos' ||
    user?.email?.includes('admin') ||
    user?.email?.includes('chairperson') ||
    userRoles.length === 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9fb] p-4">
        <CivicLoader
          size="lg"
          label="Kinokonekta sa Taguig Civic Ledger..."
          sublabel="Sangguniang Kabataan Council Workspace"
        />
      </div>
    );
  }

  const isSuperAdmin = user?.username === 'superadmin' || userRoles.includes('super_admin');
  const isSecretaryOrChairOrAdmin =
    isSuperAdmin ||
    userRoles.some((r) => ['sk_secretary', 'sk_chairperson', 'secretary', 'chairperson', 'admin'].includes(r)) ||
    user?.username === 'alyssacruz' ||
    user?.username === 'jpsantos';
  const canEditDemographics = isSuperAdmin;
  const displayName = profile?.full_name || user?.name || (isSuperAdmin ? 'System Administrator' : 'Hon. Taguig Official');
  const positionTitle = isSuperAdmin
    ? 'System Administrator'
    : (profile?.position_title || userRoles[0]?.replace('sk_', '').replace('_', ' ').toUpperCase() || 'SK Official');
  const officialId = profile?.official_id_number || `SK-2023-${user?.id || '001'}`;
  const barangayName = profile?.barangay_name || 'Barangay Central, Taguig City';
  const verifyUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify/${officialId}` : `https://taguig.gov.ph/verify/${officialId}`;

  return (
    <div className="min-h-screen bg-[#faf9fb] text-[#1b1c1e] flex flex-col font-sans">
      {/* Official System Navbar */}
      <div className="print:hidden">
        <OfficialNavbar />
      </div>

      {/* Profile Hero Header Banner (Deep Navy / Charcoal #242424) (Screen Only) */}
      <div className="print:hidden bg-[#242424] text-white px-4 sm:px-6 lg:px-10 py-10 shadow-md">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white shadow-md ring-4 ring-white/10 shrink-0 flex items-center justify-center text-3xl font-extrabold text-[#ba0c00] font-['Poppins']">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.split(' ').map((n) => n[0]).slice(0, 2).join('')
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#ba0c00] text-white text-xs font-bold font-['Inter']">
                {positionTitle}
              </div>
              <h1 className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-[#c8c6c5]">
                {barangayName} • City of Taguig
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[#c8c6c5] text-xs pt-1">
                <span>Term: 2023 – 2026</span>
                <span>•</span>
                <span>ID: {officialId}</span>
                <span>•</span>
                <span>{user?.email || 'sk.official@taguig.gov.ph'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveTab('pass')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pass'
                  ? 'bg-[#ba0c00] text-white shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              Digital Pass
            </button>

            <button
              onClick={() => setActiveTab('council')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'council'
                  ? 'bg-[#ba0c00] text-white shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">group</span>
              Council Roster
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sessions'
                  ? 'bg-[#ba0c00] text-white shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              Session Roll Call
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'bg-[#ba0c00] text-white shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit Profile
            </button>

            {isChairOrAdmin && (
              <button
                onClick={() => setActiveTab('invite')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'invite'
                    ? 'bg-[#ba0c00] text-white shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                Invite Official
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-white/10 text-rose-300 hover:bg-rose-950/60 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Summary Cards (Screen Only) */}
      <div className="print:hidden max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-10 -mt-6 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#efedf0] text-center">
            <span className="text-[11px] uppercase tracking-wider text-[#74777e] font-bold block mb-1">
              Passed Measures &amp; Resos
            </span>
            <span className="font-['Poppins'] text-2xl font-bold text-[#0e0f0f] block">
              {profile?.passed_measures_count ?? passedMeasures}
            </span>
            <span className="text-[11px] text-[#74777e]">Active Council Session</span>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#efedf0] text-center">
            <span className="text-[11px] uppercase tracking-wider text-[#74777e] font-bold block mb-1">
              Session Attendance
            </span>
            <span className="font-['Poppins'] text-2xl font-bold text-[#ba0c00] block">
              {profile?.session_attendance_rate ?? sessionAttendance}%
            </span>
            <span className="text-[11px] text-[#74777e]">Regular &amp; Special Assemblies</span>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#efedf0] text-center">
            <span className="text-[11px] uppercase tracking-wider text-[#74777e] font-bold block mb-1">
              SKMT Compliance
            </span>
            <span className="font-['Poppins'] text-2xl font-bold text-emerald-600 block">
              {(profile?.skmt_compliant ?? skmtCompliant) ? '100%' : 'Pending'}
            </span>
            <span className="text-[11px] text-[#74777e]">DILG Mandatory Certified</span>
          </div>
        </div>
      </div>

      {/* Main Workspace (Screen Only) */}
      <main className="print:hidden max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 flex-1">
        {/* TAB 1: Digital Pass */}
        {activeTab === 'pass' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* The Official Pass ID Card */}
                <div className="bg-white rounded-2xl border border-[#efedf0] shadow-sm overflow-hidden">
                  <div className="bg-[#242424] text-white p-6 flex items-center justify-between border-b-4 border-[#ba0c00]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#eebd90]">
                        Republika ng Pilipinas • Lungsod ng Taguig
                      </span>
                      <h2 className="font-['Poppins'] text-lg font-bold">
                        Sangguniang Kabataan Council Pass
                      </h2>
                      <p className="text-xs text-[#c8c6c5]">{barangayName}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#ba0c00] flex items-center justify-center font-extrabold text-white text-base shadow-sm shrink-0">
                      SK
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="shrink-0 text-center space-y-2">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#0e0f0f] flex items-center justify-center text-white text-3xl font-extrabold font-['Poppins'] shadow-md border-2 border-[#efedf0]">
                          {profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={profile.avatar_url}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            displayName.split(' ').map((n) => n[0]).slice(0, 2).join('')
                          )}
                        </div>
                        <span className="block font-mono text-[11px] text-[#ba0c00] font-bold">
                          {officialId}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <h3 className="font-['Poppins'] text-xl font-bold text-[#0e0f0f]">
                          {displayName}
                        </h3>
                        <p className="text-sm font-bold text-[#ba0c00]">{positionTitle}</p>
                        {profile?.committee_assigned && (
                          <p className="text-xs text-[#43474d]">
                            <strong className="text-[#0e0f0f]">Committee:</strong> {profile.committee_assigned}
                          </p>
                        )}
                        <div className="pt-2 grid grid-cols-2 gap-2 text-xs border-t border-[#efedf0]">
                          <div>
                            <span className="text-[10px] uppercase text-[#74777e] font-bold">Term</span>
                            <p className="font-semibold text-[#0e0f0f]">2023 - 2026</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-[#74777e] font-bold">Status</span>
                            <p className="font-semibold text-emerald-600">Active Incumbent</p>
                          </div>
                        </div>
                      </div>

                      {/* QR Code Container */}
                      <div className="shrink-0 flex flex-col items-center p-3 rounded-xl bg-[#faf9fb] border border-[#efedf0]">
                        <QRCodeSVG
                          value={verifyUrl}
                          size={96}
                          level="H"
                        />
                        <span className="text-[9px] font-mono text-[#74777e] mt-1.5 font-bold tracking-wider">
                          SCAN TO VERIFY
                        </span>
                      </div>
                    </div>

                    {profile?.bio_advocacy && (
                      <div className="p-4 bg-red-50/50 border-l-4 border-[#ba0c00] rounded-r-xl text-xs italic text-[#43474d] leading-relaxed">
                        "{profile.bio_advocacy}"
                      </div>
                    )}

                    <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#efedf0]">
                      <Link
                        href={`/verify/${officialId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#ba0c00] text-xs font-bold transition-all border border-red-200 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        Public Link
                      </Link>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setShowPvcModal(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#f5f3f6] hover:bg-[#efedf0] text-[#1b1c1e] text-xs font-bold rounded-lg transition-colors cursor-pointer border border-[#c4c6ce] shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          Preview PVC ID
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-md"
                        >
                          <span className="material-symbols-outlined text-[16px]">print</span>
                          Print Pass
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Column */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl border border-[#efedf0] shadow-sm space-y-3 text-xs">
                  <h3 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f] border-b border-[#efedf0] pb-2 flex items-center justify-between">
                    <span>Official Council Records</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[#74777e]">Official Email:</span>
                    <span className="font-semibold text-[#0e0f0f]">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#74777e]">Official Contact:</span>
                    <span className="font-semibold text-[#0e0f0f]">{profile?.contact_number || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#74777e]">Purok / Sitio:</span>
                    <span className="font-semibold text-[#0e0f0f]">{profile?.purok_sitio || 'Barangay Center'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#74777e]">Gender / Moniker:</span>
                    <span className="font-semibold text-[#0e0f0f]">
                      {profile?.gender ? profile.gender.toUpperCase() : 'N/A'} {profile?.nickname ? `("${profile.nickname}")` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#74777e]">Civil Eligibility:</span>
                    <span className="font-semibold text-[#ba0c00]">CSC / RA 10742 Certified</span>
                  </div>
                </div>

                {isChairOrAdmin && (
                  <div className="bg-[#ba0c00]/5 border border-[#ba0c00]/20 p-5 rounded-xl space-y-2.5">
                    <span className="text-xs font-bold text-[#ba0c00] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Onboard New Official
                    </span>
                    <p className="text-xs text-[#43474d] leading-relaxed">
                      Generate secure single-use invitation links for incoming Kagawads, Secretaries, or Treasurers.
                    </p>
                    <button
                      onClick={() => setActiveTab('invite')}
                      className="w-full py-2 bg-[#ba0c00] hover:bg-[#e81100] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Open Invite Generator
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Authored Measures & Passed Resolutions Showcase */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#efedf0] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#ba0c00] uppercase tracking-wider block">
                    Legislative Performance &amp; Accountability
                  </span>
                  <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f] mt-0.5">
                    Authored Measures &amp; Passed Resolutions ({measures.length})
                  </h3>
                  <p className="text-xs text-[#74777e] mt-0.5">
                    Official resolutions, ordinances, and youth policy interventions authored and co-sponsored.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMeasureTitle('');
                    setMeasureResNo('');
                    setMeasureSummary('');
                    setMeasureError(null);
                    setShowAddMeasureModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#ba0c00] hover:bg-[#e81100] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Measure
                </button>
              </div>

              {measures.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#74777e]">
                  Walang nakatalang resolusyon o ordinansa. I-click ang "+ Add Measure" upang magtala ng naipasang panukala.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {measures.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0] hover:border-[#ba0c00]/30 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-[#ba0c00]">
                            {m.resolution_number || 'RES-SK'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.status === 'passed' || m.status === 'adopted' || m.status === 'enacted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.status_badge || m.status.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f] leading-snug">
                          {m.title}
                        </h4>
                        {m.summary && (
                          <p className="text-xs text-[#43474d] line-clamp-2 leading-relaxed">
                            {m.summary}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#efedf0] flex items-center justify-between text-[11px] text-[#74777e]">
                        <span className="font-semibold text-[#0e0f0f]">
                          {m.category} • {m.authorship_label || 'Principal Author'}
                        </span>
                        <span>{m.date_approved ? new Date(m.date_approved).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Council Roster Overview */}
        {activeTab === 'council' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#ba0c00] uppercase tracking-wider">
                    Barangay Youth Council Directory
                  </span>
                  <h2 className="font-['Poppins'] text-2xl font-extrabold text-[#0e0f0f] mt-1">
                    Active Sangguniang Kabataan Council
                  </h2>
                  <p className="text-xs text-[#74777e] mt-1">
                    Internal council desk view of incumbent officials, portfolios, and contact channels.
                  </p>
                </div>

                {isChairOrAdmin && (
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ba0c00] hover:bg-[#e81100] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">add_link</span>
                    Invite Official
                  </button>
                )}
              </div>

              {councilLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-[#faf9fb] rounded-xl p-5 border border-[#efedf0] h-44" />
                  ))}
                </div>
              ) : councilOfficials.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#74777e]">
                  Walang nakitang kasamahan sa konseho.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {councilOfficials.map((officer) => (
                    <div
                      key={officer.id}
                      className="bg-[#faf9fb] rounded-xl p-4 border border-[#efedf0] hover:border-[#ba0c00]/30 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#242424] text-white flex items-center justify-center font-bold text-sm font-['Poppins'] shadow-sm shrink-0 border border-[#efedf0]">
                            {officer.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={officer.avatar_url}
                                alt={officer.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              officer.full_name
                                .split(' ')
                                .filter((w) => !w.includes('.'))
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join('')
                            )}
                          </div>
                          <div>
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-[#242424] text-white rounded">
                              {officer.position_title}
                            </span>
                            <h3 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f] leading-snug">
                              {officer.full_name}
                            </h3>
                          </div>
                        </div>

                        <div className="text-xs space-y-1 pt-1 border-t border-[#efedf0]">
                          <p className="text-[#43474d]">
                            <strong className="text-[#0e0f0f]">Portfolio:</strong> {officer.committee_assigned || 'Executive & Council Affairs'}
                          </p>
                          <p className="text-[#43474d]">
                            <strong className="text-[#0e0f0f]">Contact:</strong> {officer.contact_number || 'N/A'}
                          </p>
                          <p className="text-[#43474d]">
                            <strong className="text-[#0e0f0f]">Purok:</strong> {officer.purok_sitio || 'Barangay Center'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#efedf0] flex items-center justify-between text-xs">
                        <span className="font-mono text-[10px] text-[#ba0c00] font-bold">
                          {officer.official_id_number || `SK-${officer.id}`}
                        </span>
                        <Link
                          href={`/verify/${officer.official_id_number || officer.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-0.5 text-xs font-bold text-[#ba0c00] hover:underline"
                        >
                          View Pass
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Council Sessions & Roll Call Ledger */}
        {activeTab === 'sessions' && (
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

              {/* Sessions Performance Summary Grid */}
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
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      Certified Ledger
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0]">
                  <span className="text-[10px] font-bold text-[#74777e] uppercase tracking-wider block mb-1">
                    Secretary Custody
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-[#0e0f0f]">
                      Hon. Alyssa Marie Cruz
                    </span>
                    <span className="text-[10px] text-[#74777e]">(SK Secretary)</span>
                  </div>
                </div>
              </div>

              {/* Sessions Ledger List */}
              <div className="mt-8 space-y-4">
                <h3 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f] flex items-center justify-between">
                  <span>Assembly History &amp; Attendance Records</span>
                  <span className="text-xs font-normal text-[#74777e]">
                    Showing {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                  </span>
                </h3>

                {sessionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-[#faf9fb] rounded-xl h-24 border border-[#efedf0]" />
                    ))}
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12 rounded-xl border border-dashed border-[#efedf0] text-xs text-[#74777e] space-y-2">
                    <span className="material-symbols-outlined text-3xl text-[#c4c6ce]">event_busy</span>
                    <p>Walang nakatalang sesyon sa kasalukuyan.</p>
                    {isSecretaryOrChairOrAdmin && (
                      <button
                        onClick={handleOpenCreateSession}
                        className="text-[#ba0c00] font-bold hover:underline"
                      >
                        Magtala ng Unang Session Roll Call &rarr;
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((sess) => {
                      const isExpanded = expandedSessionId === sess.id;
                      const stats = sess.attendance_stats || {
                        total: sess.attendances?.length || 0,
                        present: sess.attendances?.filter((a) => a.status === 'present').length || 0,
                        absent: sess.attendances?.filter((a) => a.status === 'absent').length || 0,
                        excused: sess.attendances?.filter((a) => a.status === 'excused').length || 0,
                        late: sess.attendances?.filter((a) => a.status === 'late').length || 0,
                      };

                      return (
                        <div
                          key={sess.id}
                          className="bg-[#faf9fb] rounded-xl border border-[#efedf0] overflow-hidden transition-all"
                        >
                          <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#ba0c00]">
                                  {sess.session_number}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    sess.session_type === 'special'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                                  }`}
                                >
                                  {sess.session_type === 'special' ? 'Special Session' : 'Regular Session'}
                                </span>
                                <span className="text-xs text-[#74777e] flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                  {new Date(sess.session_date).toLocaleDateString('en-PH', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>

                              <h4 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                                {sess.session_title}
                              </h4>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-[#43474d] pt-0.5">
                                <span>
                                  <strong>Presided By:</strong> {sess.presided_by || 'Hon. SK Chairperson'}
                                </span>
                                <span>•</span>
                                <span>
                                  <strong>Venue:</strong> {sess.venue || 'Barangay Session Hall'}
                                </span>
                              </div>

                              {sess.notes && (
                                <p className="text-xs text-[#74777e] italic pt-1">
                                  "{sess.notes}"
                                </p>
                              )}
                            </div>

                            {/* Attendance Breakdown Pills & Action */}
                            <div className="flex flex-wrap items-center gap-3 shrink-0">
                              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#efedf0] text-xs">
                                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  {stats.present} Present
                                </span>
                                {stats.late > 0 && (
                                  <span className="flex items-center gap-1 text-blue-700 font-bold ml-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    {stats.late} Late
                                  </span>
                                )}
                                {stats.excused > 0 && (
                                  <span className="flex items-center gap-1 text-amber-700 font-bold ml-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    {stats.excused} Excused
                                  </span>
                                )}
                                {stats.absent > 0 && (
                                  <span className="flex items-center gap-1 text-rose-700 font-bold ml-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                    {stats.absent} Absent
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => setExpandedSessionId(isExpanded ? null : sess.id)}
                                className="px-3 py-1.5 bg-white hover:bg-[#efedf0] border border-[#c4c6ce] text-[#1b1c1e] text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {isExpanded ? 'expand_less' : 'expand_more'}
                                </span>
                                {isExpanded ? 'Hide Roll Call' : 'View Roll Call'}
                              </button>

                              {isSecretaryOrChairOrAdmin && (
                                <button
                                  onClick={() => handleDeleteSession(sess.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Session"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Roll Call Details */}
                          {isExpanded && (
                            <div className="border-t border-[#efedf0] bg-white p-4 sm:p-5">
                              <h5 className="font-['Poppins'] text-xs font-bold text-[#0e0f0f] uppercase tracking-wider mb-3">
                                Official Roll Call Roster Checklist
                              </h5>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                                {sess.attendances && sess.attendances.length > 0 ? (
                                  sess.attendances.map((att) => {
                                    const statusColors = {
                                      present: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                                      late: 'bg-blue-50 border-blue-200 text-blue-800',
                                      excused: 'bg-amber-50 border-amber-200 text-amber-800',
                                      absent: 'bg-rose-50 border-rose-200 text-rose-800',
                                    };

                                    return (
                                      <div
                                        key={att.id}
                                        className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                                          statusColors[att.status] || 'bg-gray-50 border-gray-200'
                                        }`}
                                      >
                                        <div>
                                          <span className="font-semibold block text-[#0e0f0f]">
                                            {att.official?.full_name || `Official #${att.official_profile_id}`}
                                          </span>
                                          <span className="text-[10px] text-[#74777e] block">
                                            {att.official?.position_title || 'Council Member'}
                                          </span>
                                        </div>
                                        <div className="mt-2 pt-1 border-t border-black/5 flex items-center justify-between">
                                          <span className="font-bold uppercase text-[10px]">
                                            {att.status_label || att.status}
                                          </span>
                                          {att.remarks && (
                                            <span
                                              className="text-[10px] truncate max-w-[100px] text-[#43474d]"
                                              title={att.remarks}
                                            >
                                              {att.remarks}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-xs text-[#74777e] col-span-full">
                                    Walang nakatalang indibidwal na attendance.
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Edit Profile & Official Portrait */}
        {activeTab === 'edit' && (
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm space-y-6">
            <div>
              <h2 className="font-['Poppins'] text-xl font-bold text-[#0e0f0f]">
                Edit Council Profile &amp; Official Portrait
              </h2>
              <p className="text-xs text-[#74777e] mt-1">
                Update your legal name, formal headshot portrait, contact line, and public advocacy statement.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                <span>{saveSuccess}</span>
              </div>
            )}

            {avatarError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                <span>{avatarError}</span>
              </div>
            )}

            {/* Avatar Upload Section */}
            <div className="p-4 bg-[#faf9fb] rounded-xl border border-[#efedf0] flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#242424] text-white text-2xl font-bold flex items-center justify-center shrink-0 border-2 border-[#efedf0] shadow-sm font-['Poppins']">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.split(' ').map((n) => n[0]).slice(0, 2).join('')
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <label className="block text-xs font-bold text-[#0e0f0f]">
                  Official Formal Portrait Photo
                </label>
                <p className="text-[11px] text-[#74777e]">
                  Upload a formal headshot (JPEG, PNG, WebP • Max 2MB).
                </p>
                <div className="pt-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    disabled={avatarLoading}
                    className="text-xs text-[#43474d] file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#242424] file:text-white hover:file:bg-[#ba0c00] file:cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Demographics Security Notice Banner */}
              {!canEditDemographics ? (
                <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-sm">
                  <span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5">lock</span>
                  <div className="space-y-0.5">
                    <span className="font-bold block">Naka-lock ang Demographic Profile Records</span>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Ang inyong opisyal na legal na pangalan, suffix, at kasarian ay protektado alinsunod sa DILG SK accreditation.
                      Kung kailangan ninyong magbago o magwasto ng inyong legal na rekord, <strong>makipag-ugnayan sa System Administrator</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-base">admin_panel_settings</span>
                  <span className="font-medium">Administrator Mode: Naka-unlock ang pagbabago ng demographic records.</span>
                </div>
              )}

              {/* Full Legal Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    <span>First Name</span>
                    {!canEditDemographics && (
                      <span className="material-symbols-outlined text-[14px] text-[#74777e]" title="Locked by Administrator">lock</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!canEditDemographics}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full h-11 px-3 rounded-lg text-sm transition-all ${
                      canEditDemographics
                        ? 'bg-white text-[#1b1c1e] border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00]'
                        : 'bg-[#f5f3f6] text-[#74777e] border border-[#e2e4ea] cursor-not-allowed select-none'
                    }`}
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    <span>Middle Name</span>
                    {!canEditDemographics && (
                      <span className="material-symbols-outlined text-[14px] text-[#74777e]" title="Locked by Administrator">lock</span>
                    )}
                  </label>
                  <input
                    type="text"
                    disabled={!canEditDemographics}
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="e.g. Ramos"
                    className={`w-full h-11 px-3 rounded-lg text-sm transition-all ${
                      canEditDemographics
                        ? 'bg-white text-[#1b1c1e] border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00]'
                        : 'bg-[#f5f3f6] text-[#74777e] border border-[#e2e4ea] cursor-not-allowed select-none'
                    }`}
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    <span>Last Name</span>
                    {!canEditDemographics && (
                      <span className="material-symbols-outlined text-[14px] text-[#74777e]" title="Locked by Administrator">lock</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!canEditDemographics}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full h-11 px-3 rounded-lg text-sm transition-all ${
                      canEditDemographics
                        ? 'bg-white text-[#1b1c1e] border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00]'
                        : 'bg-[#f5f3f6] text-[#74777e] border border-[#e2e4ea] cursor-not-allowed select-none'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    <span>Suffix</span>
                    {!canEditDemographics && (
                      <span className="material-symbols-outlined text-[14px] text-[#74777e]" title="Locked by Administrator">lock</span>
                    )}
                  </label>
                  <input
                    type="text"
                    disabled={!canEditDemographics}
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="e.g. Jr., III"
                    className={`w-full h-11 px-3 rounded-lg text-sm transition-all ${
                      canEditDemographics
                        ? 'bg-white text-[#1b1c1e] border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00]'
                        : 'bg-[#f5f3f6] text-[#74777e] border border-[#e2e4ea] cursor-not-allowed select-none'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Nickname / Moniker
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. JP, Aly, Marc"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    <span>Gender</span>
                    {!canEditDemographics && (
                      <span className="material-symbols-outlined text-[14px] text-[#74777e]" title="Locked by Administrator">lock</span>
                    )}
                  </label>
                  <select
                    disabled={!canEditDemographics}
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className={`w-full h-11 px-3 rounded-lg text-sm transition-all ${
                      canEditDemographics
                        ? 'bg-white text-[#1b1c1e] border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00] cursor-pointer'
                        : 'bg-[#f5f3f6] text-[#74777e] border border-[#e2e4ea] cursor-not-allowed select-none'
                    }`}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Non-Binary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="0917XXXXXXX"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Purok / Sitio Residence
                  </label>
                  <input
                    type="text"
                    value={purokSitio}
                    onChange={(e) => setPurokSitio(e.target.value)}
                    placeholder="e.g. Purok 1 - Maharlika"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                  Youth Advocacy &amp; Leadership Vision Statement
                </label>
                <textarea
                  rows={4}
                  value={bioAdvocacy}
                  onChange={(e) => setBioAdvocacy(e.target.value)}
                  placeholder="Share your council vision and advocacy for the barangay youth..."
                  className="w-full p-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                />
              </div>

              {/* Council & Legislative Performance Records */}
              <div className="p-5 bg-[#faf9fb] rounded-xl border border-[#efedf0] space-y-4">
                <div className="flex items-center justify-between border-b border-[#efedf0] pb-2.5">
                  <span className="text-xs font-bold text-[#0e0f0f] uppercase tracking-wider block">
                    Legislative &amp; Council Performance Records
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-200 text-[#0e0f0f]">
                    DILG / RA 10742 Audited
                  </span>
                </div>

                {/* Authored Measures Ledger in Profile */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#0e0f0f]">
                        Passed Measures &amp; Authored Resolutions ({measures.length})
                      </label>
                      <p className="text-[11px] text-[#74777e]">
                        Auto-tallied passed count: <strong className="text-[#ba0c00] font-mono">{passedMeasures}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMeasureTitle('');
                        setMeasureResNo('');
                        setMeasureSummary('');
                        setMeasureError(null);
                        setShowAddMeasureModal(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ba0c00] hover:bg-[#e81100] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Add Resolution
                    </button>
                  </div>

                  {measures.length === 0 ? (
                    <div className="p-3 rounded-lg bg-white border border-dashed border-[#efedf0] text-center text-xs text-[#74777e]">
                      Walang nakatalang resolusyon. I-click ang "+ Add Resolution" upang itala ang inyong mga panukala.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {measures.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 bg-white rounded-lg border border-[#efedf0] flex items-center justify-between gap-3 text-xs shadow-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-[#ba0c00] font-bold shrink-0">
                                {m.resolution_number || 'RES-SK'}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                  m.status === 'passed' || m.status === 'adopted' || m.status === 'enacted'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {m.status_badge || m.status}
                              </span>
                              <span className="font-semibold text-[#0e0f0f] truncate">
                                {m.title}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#74777e] mt-0.5">
                              {m.category} • {m.authorship_label || 'Principal Author'} • {m.date_approved ? new Date(m.date_approved).toLocaleDateString('en-PH') : 'Pending'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteMeasure(m.id)}
                            className="p-1 text-[#74777e] hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                            title="Delete Measure Record"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Session Attendance Rate (Secretary-Certified Lock) */}
                <div className="pt-2 border-t border-[#efedf0] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#0e0f0f]">
                      <span>Session Attendance Rate (%)</span>
                      <span className="material-symbols-outlined text-[14px] text-[#74777e]" title="Locked - Certified by SK Secretary Roll Call Ledger">lock</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('sessions')}
                      className="text-xs font-bold text-[#ba0c00] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View Session Ledger</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        max={100}
                        disabled={!canEditDemographics}
                        value={sessionAttendance}
                        onChange={(e) => setSessionAttendance(parseFloat(e.target.value) || 0)}
                        className={`w-full h-11 px-3 rounded-lg text-sm transition-all font-mono font-bold ${
                          canEditDemographics
                            ? 'bg-white text-[#1b1c1e] border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00]'
                            : 'bg-[#f5f3f6] text-[#ba0c00] border border-[#e2e4ea] cursor-not-allowed select-none'
                        }`}
                      />
                      <span className="absolute right-3 top-3 text-xs text-[#74777e] font-semibold">
                        %
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-tight flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0">how_to_reg</span>
                      <div>
                        <strong className="block font-bold">Secretary Roll Call Certified</strong>
                        <span className="text-[10px] text-emerald-700">Reflects active Sanggunian session attendance ledger.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#efedf0]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={skmtCompliant}
                      onChange={(e) => setSkmtCompliant(e.target.checked)}
                      className="w-4 h-4 rounded text-[#ba0c00] focus:ring-0 cursor-pointer accent-[#ba0c00]"
                    />
                    <span className="text-xs font-semibold text-[#0e0f0f]">
                      DILG Sangguniang Kabataan Mandatory Training (SKMT) Certified
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2.5 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {saveLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: Invite Generator */}
        {activeTab === 'invite' && isChairOrAdmin && (
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm space-y-5">
            <div>
              <h2 className="font-['Poppins'] text-xl font-bold text-[#0e0f0f]">
                Generate Council Invitation Link
              </h2>
              <p className="text-xs text-[#74777e] mt-1">
                Generate single-use cryptographic invitation links. The official will set their username and password upon accessing the link.
              </p>
            </div>

            {inviteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                <span>{inviteError}</span>
              </div>
            )}

            {generatedInviteUrl && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Invitation Link Active (7-day validity)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteUrl}
                    className="flex-1 bg-white border border-emerald-300 rounded-lg px-3 py-2 text-xs font-mono text-[#0e0f0f]"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedInviteUrl)}
                    className="px-3.5 py-2 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleGenerateInvite} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    placeholder="e.g. Maria"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    placeholder="e.g. Santos"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                  Designated Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. kagawad.env@skportal.gov.ph"
                  className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Position
                  </label>
                  <select
                    value={invitePosition}
                    onChange={(e: any) => setInvitePosition(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00] cursor-pointer"
                  >
                    <option value="kagawad">SK Kagawad (Councilor)</option>
                    <option value="secretary">SK Secretary</option>
                    <option value="treasurer">SK Treasurer</option>
                    <option value="chairperson">SK Chairperson</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Committee Assigned
                  </label>
                  <input
                    type="text"
                    value={inviteCommittee}
                    onChange={(e) => setInviteCommittee(e.target.value)}
                    placeholder="e.g. Committee on Environment"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-5 py-2.5 bg-[#ba0c00] hover:bg-[#e81100] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {inviteLoading ? 'Generating...' : 'Generate Single-Use Link'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL 1: Add Authored Measure / Resolution (Item 1) */}
      {showAddMeasureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#efedf0] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#efedf0]">
              <div>
                <span className="text-[10px] font-bold text-[#ba0c00] uppercase tracking-wider block">
                  Legislative Performance Record
                </span>
                <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f]">
                  Record Authored Measure or Resolution
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMeasureModal(false)}
                className="text-[#74777e] hover:text-[#0e0f0f] font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {measureError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                <span>{measureError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMeasure} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                  Measure Title *
                </label>
                <input
                  type="text"
                  required
                  value={measureTitle}
                  onChange={(e) => setMeasureTitle(e.target.value)}
                  placeholder="e.g. Resolution Authorizing the Annual Barangay Youth Investment Program (ABYIP)"
                  className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Resolution Number
                  </label>
                  <input
                    type="text"
                    value={measureResNo}
                    onChange={(e) => setMeasureResNo(e.target.value)}
                    placeholder="e.g. RES-2024-001"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Committee Category
                  </label>
                  <select
                    value={measureCategory}
                    onChange={(e) => setMeasureCategory(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00] cursor-pointer"
                  >
                    <option value="Youth Empowerment">Youth Empowerment</option>
                    <option value="Education & Culture">Education & Culture</option>
                    <option value="Sports & Wellness">Sports & Wellness</option>
                    <option value="Disaster Risk Reduction">Disaster Risk Reduction (DRRM)</option>
                    <option value="Health & Anti-Drug Abuse">Health & Anti-Drug Abuse</option>
                    <option value="Environment & Climate Action">Environment & Climate Action</option>
                    <option value="Rules, Administration & Budget">Rules, Administration & Budget</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Authorship Role
                  </label>
                  <select
                    value={measureRole}
                    onChange={(e: any) => setMeasureRole(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00] cursor-pointer"
                  >
                    <option value="principal_author">Principal Author</option>
                    <option value="co_author">Co-Author</option>
                    <option value="sponsor">Sponsor</option>
                    <option value="co_sponsor">Co-Sponsor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Legislative Status
                  </label>
                  <select
                    value={measureStatus}
                    onChange={(e: any) => setMeasureStatus(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00] cursor-pointer"
                  >
                    <option value="passed">Passed / Approved</option>
                    <option value="adopted">Adopted</option>
                    <option value="enacted">Enacted</option>
                    <option value="under_review">Under Review</option>
                    <option value="tabled">Tabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Date Approved
                  </label>
                  <input
                    type="date"
                    value={measureDate}
                    onChange={(e) => setMeasureDate(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00] cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                  Brief Summary / Legislative Objective
                </label>
                <textarea
                  rows={3}
                  value={measureSummary}
                  onChange={(e) => setMeasureSummary(e.target.value)}
                  placeholder="Outline key programs, funding allocations, or community youth objectives..."
                  className="w-full p-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddMeasureModal(false)}
                  className="px-4 py-2.5 bg-[#efedf0] hover:bg-[#e9e8ea] text-[#1b1c1e] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={measureSubmitting}
                  className="px-5 py-2.5 bg-[#ba0c00] hover:bg-[#e81100] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  {measureSubmitting ? 'Recording...' : 'Save Measure Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Session Roll Call (Item 2-A) */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-[#efedf0] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#efedf0]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#ba0c00] uppercase tracking-wider">
                    Council Session Roll Call Journal
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Secretary Custody
                  </span>
                </div>
                <h3 className="font-['Poppins'] text-xl font-bold text-[#0e0f0f] mt-0.5">
                  Record Sanggunian Session &amp; Roll Call
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateSessionModal(false)}
                className="text-[#74777e] hover:text-[#0e0f0f] font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sessionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                <span>{sessionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSessionRollCall} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Session Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(e.target.value)}
                    placeholder="e.g. RS-2024-04"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Session Type *
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e: any) => setSessionType(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00] cursor-pointer"
                  >
                    <option value="regular">Regular Session</option>
                    <option value="special">Special Session</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. 4th Regular Sanggunian Session - Youth Leadership Summit"
                  className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Date of Session *
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={sessionVenue}
                    onChange={(e) => setSessionVenue(e.target.value)}
                    placeholder="Barangay Session Hall"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Presiding Officer
                  </label>
                  <input
                    type="text"
                    value={sessionPresidedBy}
                    onChange={(e) => setSessionPresidedBy(e.target.value)}
                    placeholder="Hon. John Patrick Santos"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                  />
                </div>
              </div>

              {/* Council Roll Call Attendance Checklist */}
              <div className="p-4 bg-[#faf9fb] rounded-xl border border-[#efedf0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f]">
                      Council Member Attendance Checklist
                    </h4>
                    <p className="text-[11px] text-[#74777e]">
                      Mark attendance for each official. Updates attendance percentages upon saving.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#ba0c00]">
                    {councilOfficials.length} Council Officials
                  </span>
                </div>

                <div className="space-y-2.5">
                  {councilOfficials.map((officer) => {
                    const currentStatus = sessionRollCall[officer.id]?.status || 'present';
                    const currentRemarks = sessionRollCall[officer.id]?.remarks || '';

                    const setStatus = (status: SessionAttendanceStatus) => {
                      setSessionRollCall((prev) => ({
                        ...prev,
                        [officer.id]: {
                          status,
                          remarks: prev[officer.id]?.remarks || '',
                        },
                      }));
                    };

                    const setRemarks = (remarks: string) => {
                      setSessionRollCall((prev) => ({
                        ...prev,
                        [officer.id]: {
                          status: prev[officer.id]?.status || 'present',
                          remarks,
                        },
                      }));
                    };

                    return (
                      <div
                        key={officer.id}
                        className="p-3 bg-white rounded-lg border border-[#efedf0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 sm:w-1/3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#242424] text-white flex items-center justify-center font-bold text-xs shrink-0 font-['Poppins']">
                            {officer.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={officer.avatar_url} alt={officer.full_name} className="w-full h-full object-cover" />
                            ) : (
                              officer.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                            )}
                          </div>
                          <div className="truncate">
                            <span className="font-semibold block text-[#0e0f0f] truncate">
                              {officer.full_name}
                            </span>
                            <span className="text-[10px] text-[#ba0c00] font-bold block">
                              {officer.position_title}
                            </span>
                          </div>
                        </div>

                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setStatus('present')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus('late')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'late'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus('excused')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'excused'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                            }`}
                          >
                            Excused
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus('absent')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            Absent
                          </button>
                        </div>

                        {/* Remarks */}
                        <div className="sm:w-1/3">
                          <input
                            type="text"
                            value={currentRemarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Remarks (e.g. Official business)"
                            className="w-full h-8 px-2.5 bg-[#faf9fb] border border-[#efedf0] rounded text-[11px] focus:outline-none focus:border-[#ba0c00]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                  Session Highlights &amp; Legislative Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Key resolutions approved, quorum notes, or motions..."
                  className="w-full p-3 bg-white border border-[#c4c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ba0c00]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
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

      {/* MODAL: Printable PVC ID Pass Preview */}
      {showPvcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#efedf0] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#efedf0]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba0c00]">badge</span>
                <h3 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                  Standard PVC Official Pass Preview
                </h3>
              </div>
              <button
                onClick={() => setShowPvcModal(false)}
                className="text-[#74777e] hover:text-[#0e0f0f] font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Front & Back Cards Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front Badge */}
              <div className="w-full bg-[#242424] text-white rounded-xl overflow-hidden shadow-md border border-neutral-700 flex flex-col justify-between h-[280px] p-4 relative">
                <div className="flex items-center justify-between border-b border-neutral-700 pb-2">
                  <div className="text-[9px] uppercase tracking-wider text-[#eebd90] font-bold leading-tight">
                    Republic of the Philippines<br />
                    City of Taguig • SK Council
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#ba0c00] flex items-center justify-center font-bold text-xs text-white">
                    SK
                  </div>
                </div>

                <div className="flex items-center gap-3 my-auto">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white text-[#242424] flex items-center justify-center text-xl font-bold font-['Poppins'] shadow shrink-0">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      displayName.split(' ').map((n) => n[0]).slice(0, 2).join('')
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#ba0c00] rounded text-white inline-block">
                      {positionTitle.toUpperCase()}
                    </span>
                    <h4 className="font-['Poppins'] text-sm font-bold leading-snug line-clamp-2">
                      {displayName}
                    </h4>
                    <p className="text-[10px] text-neutral-300 font-mono font-bold text-[#eebd90]">
                      {officialId}
                    </p>
                    <p className="text-[9px] text-neutral-400">
                      {barangayName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-700 text-[8px] text-neutral-400">
                  <span>TERM: 2023 - 2026</span>
                  <span className="text-emerald-400 font-bold">ACTIVE INCUMBENT</span>
                </div>
              </div>

              {/* Back Badge */}
              <div className="w-full bg-white text-[#1b1c1e] rounded-xl overflow-hidden shadow-md border border-[#efedf0] flex flex-col justify-between h-[280px] p-4 relative">
                <div className="border-b border-[#efedf0] pb-1.5 text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#ba0c00] block">
                    Official Council Accreditation
                  </span>
                  <span className="text-[8px] text-[#74777e]">Republic Act No. 10742 / RA 11768</span>
                </div>

                <div className="flex items-center justify-between gap-3 my-auto">
                  <div className="p-1 bg-[#faf9fb] border border-[#efedf0] rounded shrink-0">
                    <QRCodeSVG value={verifyUrl} size={64} level="M" />
                  </div>
                  <div className="text-[9px] text-[#43474d] space-y-1">
                    <p>
                      <strong>Committee:</strong> {profile?.committee_assigned || 'Executive & Council Affairs'}
                    </p>
                    <p>
                      <strong>Emergency:</strong> {profile?.contact_number || 'Barangay Hall Desk'}
                    </p>
                    <p className="text-[8px] text-[#74777e] leading-tight">
                      Scan QR code or visit taguig.gov.ph to verify authentic active incumbency.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#efedf0] flex items-center justify-between text-[8px] text-center">
                  <div className="border-t border-[#0e0f0f] pt-0.5 w-24">
                    <span className="block font-semibold">Official Signature</span>
                  </div>
                  <div className="border-t border-[#0e0f0f] pt-0.5 w-24">
                    <span className="block font-semibold">DILG City Director</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPvcModal(false)}
                className="px-4 py-2 bg-[#efedf0] hover:bg-[#e9e8ea] text-[#1b1c1e] text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Isara
              </button>
              <button
                onClick={() => {
                  setShowPvcModal(false);
                  window.print();
                }}
                className="px-5 py-2 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                I-print ang PVC Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED PRINTABLE PVC PASS LAYOUT (Displays ONLY on window.print()) */}
      <div className="hidden print:flex print:flex-col print:items-center print:justify-center print:min-h-screen print:p-8 print:bg-white text-black font-sans">
        <div className="flex flex-row items-center justify-center gap-8">
          {/* Printable Front Badge (Standard CR80 Size) */}
          <div className="w-[340px] h-[215px] rounded-xl border-2 border-black bg-neutral-900 text-white p-4 flex flex-col justify-between shadow-none">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-1.5">
              <div className="text-[8px] uppercase tracking-wider text-amber-300 font-bold leading-tight">
                Republika ng Pilipinas<br />
                Lungsod ng Taguig • SK Council
              </div>
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center font-bold text-[10px] text-white">
                SK
              </div>
            </div>

            <div className="flex items-center gap-3 my-auto">
              <div className="w-20 h-20 rounded-md overflow-hidden bg-white text-black flex items-center justify-center text-xl font-bold shrink-0 border border-neutral-600">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName.split(' ').map((n) => n[0]).slice(0, 2).join('')
                )}
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-red-600 rounded text-white inline-block">
                  {positionTitle.toUpperCase()}
                </span>
                <h4 className="text-xs font-bold leading-tight">
                  {displayName}
                </h4>
                <p className="text-[9px] font-mono font-bold text-amber-300">
                  {officialId}
                </p>
                <p className="text-[8px] text-neutral-300">
                  {barangayName}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-neutral-700 text-[8px] text-neutral-300">
              <span>TERM: 2023 - 2026</span>
              <span className="font-bold text-emerald-400">ACTIVE INCUMBENT</span>
            </div>
          </div>

          {/* Printable Back Badge (Standard CR80 Size) */}
          <div className="w-[340px] h-[215px] rounded-xl border-2 border-black bg-white text-black p-4 flex flex-col justify-between shadow-none">
            <div className="border-b border-neutral-300 pb-1 text-center">
              <span className="text-[8px] font-bold uppercase tracking-wider text-red-600 block">
                Official Council Accreditation Pass
              </span>
              <span className="text-[7px] text-neutral-600">Republic Act No. 10742 as amended by RA 11768</span>
            </div>

            <div className="flex items-center justify-between gap-3 my-auto">
              <div className="p-1 border border-neutral-400 rounded shrink-0">
                <QRCodeSVG value={verifyUrl} size={64} level="M" />
              </div>
              <div className="text-[8px] text-neutral-800 space-y-0.5">
                <p>
                  <strong>Committee:</strong> {profile?.committee_assigned || 'Executive & Council Affairs'}
                </p>
                <p>
                  <strong>Contact:</strong> {profile?.contact_number || 'Barangay Center'}
                </p>
                <p className="text-[7px] text-neutral-500 leading-tight">
                  Scan QR code to verify authentic incumbent status on the Taguig Civic Ledger.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-300 flex items-center justify-between text-[7px] text-center">
              <div className="border-t border-black pt-0.5 w-24">
                <span className="block font-semibold">Official Signature</span>
              </div>
              <div className="border-t border-black pt-0.5 w-24">
                <span className="block font-semibold">DILG City Director</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
