'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import apiClient from '@/lib/api/client';
import OfficialNavbar from '@/components/layout/official-navbar';
import CivicLoader from '@/components/ui/civic-loader';
import { TAGUIG_BARANGAYS, SUGGESTED_SKILLS, EDUCATIONAL_LEVELS } from '@/lib/constants';
import useSystemSettings from '@/hooks/use-system-settings';
import {
  User,
  SkOfficialProfile,
  OfficialMeasure,
  AuthorshipRole,
  MeasureStatus,
} from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { settings } = useSystemSettings();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SkOfficialProfile | null>(null);
  const [councilOfficials, setCouncilOfficials] = useState<SkOfficialProfile[]>([]);
  const [allOfficialsList, setAllOfficialsList] = useState<SkOfficialProfile[]>([]);
  const [portalStats, setPortalStats] = useState<any | null>(null);
  const [councilLoading, setCouncilLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'pass' | 'skills' | 'council' | 'treasury' | 'committee' | 'measures' | 'edit' | 'invite' | 'overview' | 'skills_analytics'
  >('pass');

  // Measures State (Item 1 - Opsyonal)
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

  // Profile & Skills Profiling State
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [bioAdvocacy, setBioAdvocacy] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [nickname, setNickname] = useState('');
  const [purokSitio, setPurokSitio] = useState('');
  const [skills, setSkills] = useState<string[]>(['Project Management', 'Youth Leadership', 'Event Organizing']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [educationalAttainment, setEducationalAttainment] = useState<string>("Bachelor's Degree / College Graduate");
  const [educationDegree, setEducationDegree] = useState('BS Information Technology');
  const [educationSchool, setEducationSchool] = useState('Taguig City University');
  const [adminBarangaySearch, setAdminBarangaySearch] = useState('');
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

  // Barangay Council Directory Search & Filter State
  const [councilSearch, setCouncilSearch] = useState('');
  const [councilRoleFilter, setCouncilRoleFilter] = useState('all');
  const [councilPurokFilter, setCouncilPurokFilter] = useState('all');

  const availablePuroks = useMemo(() => {
    const set = new Set<string>();
    councilOfficials.forEach((o) => {
      if (o.purok_sitio && o.purok_sitio.trim()) {
        set.add(o.purok_sitio.trim());
      }
    });
    return Array.from(set).sort();
  }, [councilOfficials]);

  const filteredCouncilOfficials = useMemo(() => {
    return councilOfficials.filter((officer) => {
      // 1. Text search (Name, Position, Committee, Contact, Purok)
      const q = councilSearch.trim().toLowerCase();
      if (q) {
        const matchName = officer.full_name?.toLowerCase().includes(q);
        const matchPos = officer.position_title?.toLowerCase().includes(q) || officer.position?.toLowerCase().includes(q);
        const matchCommittee = officer.committee_assigned?.toLowerCase().includes(q);
        const matchContact = officer.contact_number?.toLowerCase().includes(q);
        const matchPurok = officer.purok_sitio?.toLowerCase().includes(q);
        if (!matchName && !matchPos && !matchCommittee && !matchContact && !matchPurok) {
          return false;
        }
      }

      // 2. Position Filter
      if (councilRoleFilter !== 'all') {
        const pos = (officer.position || '').toLowerCase();
        const title = (officer.position_title || '').toLowerCase();
        const target = councilRoleFilter.toLowerCase();
        if (target === 'chairperson' && !pos.includes('chair') && !title.includes('chair')) return false;
        if (target === 'kagawad' && !pos.includes('kagawad') && !title.includes('kagawad')) return false;
        if (target === 'secretary' && !pos.includes('sec') && !title.includes('sec')) return false;
        if (target === 'treasurer' && !pos.includes('treas') && !title.includes('treas')) return false;
      }

      // 3. Purok Filter
      if (councilPurokFilter !== 'all') {
        if ((officer.purok_sitio || '').trim() !== councilPurokFilter) return false;
      }

      return true;
    });
  }, [councilOfficials, councilSearch, councilRoleFilter, councilPurokFilter]);

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

        // Admin must ONLY access the super admin console and nowhere more
        const storedUser = localStorage.getItem('sk_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed?.roles?.includes('super_admin') || parsed?.username === 'superadmin') {
              router.replace('/admin');
              return;
            }
          } catch { }
        }

        const meRes = await apiClient.get('/auth/me');
        if (meRes.data?.data) {
          const userData = meRes.data.data.user || meRes.data.data;
          setUser(userData);

          const isUserAdmin = userData.roles?.includes('super_admin') || userData.username === 'superadmin';
          if (isUserAdmin) {
            router.replace('/admin');
            return;
          }

          setActiveTab('pass');

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
              if (prof.skills && Array.isArray(prof.skills) && prof.skills.length > 0) {
                setSkills(prof.skills);
              }
              if (prof.educational_attainment) {
                setEducationalAttainment(prof.educational_attainment);
              }
              if (prof.education_degree) {
                setEducationDegree(prof.education_degree);
              }
              if (prof.education_school) {
                setEducationSchool(prof.education_school);
              }
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

  // Fetch council roster when tab is opened
  useEffect(() => {
    if (activeTab === 'council' && councilOfficials.length === 0) {
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
        educational_attainment: educationalAttainment,
        education_degree: educationDegree,
        education_school: educationSchool,
        skills: skills,
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

  const handleSaveSkills = async () => {
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
        educational_attainment: educationalAttainment,
        education_degree: educationDegree,
        education_school: educationSchool,
        skills: skills,
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
        setSaveSuccess('Matagumpay na na-update ang inyong mga hard skills at youth competencies!');
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } catch (err: any) {
      console.error('Failed to save skills:', err);
      alert(err.response?.data?.message || 'Bigo ang pag-save ng skills.');
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

  // Super Admins must ONLY access the Super Admin Console and nowhere more
  if (isSuperAdmin) {
    if (typeof window !== 'undefined') {
      router.replace('/admin');
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9fb] p-4">
        <CivicLoader
          size="lg"
          label="Kinokonekta sa Super Admin Console..."
          sublabel={`${settings.jurisdiction_name || 'Sangguniang Kabataan Federation'} • Lungsod ng Taguig`}
        />
      </div>
    );
  }

  const isChairperson = userRoles.includes('sk_chairperson') || userRoles.includes('chairperson') || user?.username === 'jpsantos';
  const isSecretary = userRoles.includes('sk_secretary') || userRoles.includes('secretary') || user?.username === 'alyssacruz';
  const isTreasurer = userRoles.includes('sk_treasurer') || userRoles.includes('treasurer') || user?.username === 'rafatan';
  const isKagawad = userRoles.includes('sk_kagawad') || userRoles.includes('kagawad') || (!isSuperAdmin && !isChairperson && !isSecretary && !isTreasurer);
  const isSecretaryOrChairOrAdmin = isSuperAdmin || isSecretary || isChairperson;
  const canEditDemographics = isSuperAdmin;

  const displayName = isSuperAdmin ? 'Federation Administrator' : (profile?.full_name || user?.name || 'Hon. Taguig Official');
  const positionTitle = isSuperAdmin
    ? 'SYSTEM ADMINISTRATOR'
    : (profile?.position_title || userRoles[0]?.replace('sk_', '').replace('_', ' ').toUpperCase() || 'SK OFFICIAL');
  const officialId = profile?.official_id_number || `SK-2023-${user?.id || '001'}`;
  const barangayName = profile?.barangay_name || 'Barangay Central, Taguig City';
  const verifyUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify/${officialId}` : `https://taguig.gov.ph/verify/${officialId}`;

  return (
    <div className="min-h-screen bg-[#faf9fb] text-[#1b1c1e] flex flex-col font-sans">
      {/* Official System Navbar */}
      <div className="print:hidden">
        <OfficialNavbar />
      </div>

      {/* Role-Specific Hero Header Banner (Screen Only) */}
      <div className="print:hidden bg-[#242424] text-white px-4 sm:px-6 lg:px-10 py-10 shadow-md">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {isSuperAdmin ? (
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#ba0c00] flex items-center justify-center text-white shadow-lg shrink-0">
                <span className="material-symbols-outlined text-4xl sm:text-5xl">admin_panel_settings</span>
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ba0c00] text-white text-xs font-bold font-['Inter']">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  FEDERATION SUPER ADMINISTRATOR
                </div>
                <h1 className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Taguig SK Federation Overview
                </h1>
                <p className="text-xs sm:text-sm text-[#c8c6c5]">
                  City-Wide Administrative Supervision • 38 Barangays
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[#c8c6c5] text-xs pt-0.5">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Central Civic Ledger Live
                  </span>
                  <span>•</span>
                  <span>Super Admin Account: {user?.email || 'admin@skportal.gov.ph'}</span>
                </div>
              </div>
            </div>
          ) : (
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
                  {`Barangay ${barangayName} • City of Taguig`}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[#c8c6c5] text-xs pt-1">
                  <span>{settings.current_term_label || 'Term: 2023 – 2026'}</span>
                  <span>•</span>
                  <span>{user?.email || 'sk.official@taguig.gov.ph'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Differentiated Header Action Tabs (Single sign-out is preserved on upper right navbar) */}
          <div className="flex flex-wrap gap-2 justify-center">
            {isSuperAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#ba0c00] text-white hover:bg-[#920a00] shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[17px]">admin_panel_settings</span>
                  Super Admin Console
                </Link>

                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'overview'
                    ? 'bg-white/25 text-white shadow-sm ring-1 ring-white/30'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  <span className="material-symbols-outlined text-[17px]">dashboard</span>
                  Federation Matrix
                </button>

                <button
                  onClick={() => setActiveTab('skills_analytics')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'skills_analytics'
                    ? 'bg-[#ba0c00] text-white shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  <span className="material-symbols-outlined text-[17px]">psychology</span>
                  Skills Analytics
                </button>

                <button
                  onClick={() => setActiveTab('invite')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'invite'
                    ? 'bg-[#ba0c00] text-white shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  <span className="material-symbols-outlined text-[17px]">person_add</span>
                  Generate Invite
                </button>

                <Link
                  href="/officials"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[17px]">group</span>
                  View All Officials ({allOfficialsList.length || 228})
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('pass')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'pass'
                    ? 'bg-[#ba0c00] text-white shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  <span className="material-symbols-outlined text-[16px]">badge</span>
                  My Profile &amp; Pass
                </button>

                <button
                  onClick={() => setActiveTab('skills')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'skills'
                    ? 'bg-[#ba0c00] text-white shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  Profiling ng Skills
                </button>

                <button
                  onClick={() => setActiveTab('council')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'council'
                    ? 'bg-[#ba0c00] text-white shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  Barangay Council
                </button>

                {isChairperson && (
                  <button
                    onClick={() => setActiveTab('invite')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'invite'
                      ? 'bg-[#ba0c00] text-white shadow-sm'
                      : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    Invite Member
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('edit')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'edit'
                    ? 'bg-[#ba0c00] text-white shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Key Metric Summary Cards (Screen Only) */}
      <div className="print:hidden max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-10 -mt-6 z-10">
        {isSuperAdmin ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#efedf0] text-center">
              <span className="text-[11px] uppercase tracking-wider text-[#74777e] font-bold block mb-1">
                Barangays Represented
              </span>
              <span className="font-['Poppins'] text-2xl font-bold text-[#ba0c00] block">
                {portalStats?.total_jurisdiction_barangays || 38} / 38
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">100% City-Wide Onboarded</span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#efedf0] text-center">
              <span className="text-[11px] uppercase tracking-wider text-[#74777e] font-bold block mb-1">
                Total SK Officials
              </span>
              <span className="font-['Poppins'] text-2xl font-bold text-[#0e0f0f] block">
                {portalStats?.total_registered_officials || 228}
              </span>
              <span className="text-[11px] text-[#74777e]">Across 38 Taguig Barangays</span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#efedf0] text-center">
              <span className="text-[11px] uppercase tracking-wider text-[#74777e] font-bold block mb-1">
                SKMT Certification Rate
              </span>
              <span className="font-['Poppins'] text-2xl font-bold text-emerald-600 block">
                {portalStats?.skmt_certified_percentage || 100}%
              </span>
              <span className="text-[11px] text-[#74777e]">DILG RA 10742 Compliant</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#efedf0] text-center">
              <span className="text-[11px] uppercase tracking-wider text-[#74777e] font-bold block mb-1">
                Hard Skills Profiled
              </span>
              <span className="font-['Poppins'] text-2xl font-bold text-[#ba0c00] block">
                {skills.length}
              </span>
              <span className="text-[11px] text-[#74777e]">Verified Competencies</span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#efedf0] text-center">
              <span className="text-[11px] uppercase tracking-wider text-[#74777e] font-bold block mb-1">
                Educational Attainment
              </span>
              <span className="font-['Poppins'] text-lg font-bold text-[#0e0f0f] block truncate">
                {educationalAttainment || "College Graduate"}
              </span>
              <span className="text-[11px] text-[#74777e] truncate block">
                {educationDegree || 'Verified Credential'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace (Screen Only) */}
      <main className="print:hidden max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 flex-1">
        {/* TAB 1: Digital Pass & Competencies */}
        {activeTab === 'pass' && !isSuperAdmin && (
          <div className="space-y-6">
            {/* Hard Skills & Youth Competencies Card (Shows BEFORE Council Pass) */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#efedf0] shadow-sm space-y-6">
              <div className="border-b border-[#efedf0] pb-4">
                <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f]">
                  Hard Skills &amp; Youth Competencies
                </h3>
                <p className="text-xs text-[#74777e] mt-1">
                  Opisyal na talaan ng mga kakayahan at kwalipikasyon para sa pamumuno sa barangay.
                </p>
              </div>

              {/* Skills Badges Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#74777e]">
                  <span className="material-symbols-outlined text-[16px] text-[#ba0c00]">psychology</span>
                  <span>Mga Natukoy na Kasanayan ({skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.length === 0 ? (
                    <div className="text-xs text-[#74777e] italic p-4 bg-[#faf9fb] rounded-xl border border-[#efedf0] w-full text-center">
                      Wala pang nakatalang kasanayan sa profile.
                    </div>
                  ) : (
                    skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#faf9fb] border border-[#efedf0] text-[#0e0f0f] text-xs font-semibold hover:border-[#c4c6ce] hover:bg-white transition-colors shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[#ba0c00]">verified</span>
                        <span>{skill}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Educational Background Highlight */}
              <div className="pt-4 border-t border-[#efedf0] space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#74777e]">
                  <span className="material-symbols-outlined text-[16px] text-[#ba0c00]">school</span>
                  <span>Background sa Edukasyon</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#faf9fb] rounded-xl border border-[#efedf0]">
                    <span className="text-[10px] uppercase font-bold text-[#74777e] block">Antas ng Edukasyon</span>
                    <span className="font-bold text-[#0e0f0f] text-xs mt-1 block truncate">
                      {educationalAttainment || "College Graduate"}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#faf9fb] rounded-xl border border-[#efedf0]">
                    <span className="text-[10px] uppercase font-bold text-[#74777e] block">Kurso / Programa</span>
                    <span className="font-semibold text-[#0e0f0f] text-xs mt-1 block truncate">
                      {educationDegree || 'N/A'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#faf9fb] rounded-xl border border-[#efedf0]">
                    <span className="text-[10px] uppercase font-bold text-[#74777e] block">Paaralan / Unibersidad</span>
                    <span className="font-semibold text-[#0e0f0f] text-xs mt-1 block truncate">
                      {educationSchool || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* The Official Pass ID Card & Official Council Records */}
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
                            <p className="font-semibold text-[#0e0f0f]">
                              {settings.current_term_label ? settings.current_term_label.replace(/^Term\s*/i, '') : '2023 - 2026'}
                            </p>
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
                    <span className="text-[#74777e]">Gender / Nickname:</span>
                    <span className="font-semibold text-[#0e0f0f]">
                      {profile?.gender ? profile.gender.toUpperCase() : 'N/A'} {profile?.nickname ? `("${profile.nickname}")` : ''}
                    </span>
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
          </div>
        )}

        {/* TAB: Dedicated Profiling ng Skills & Education */}
        {activeTab === 'skills' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm space-y-6">
            <div className="border-b border-[#efedf0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Youth Leadership Intake
                </span>
                <h2 className="font-['Poppins'] text-2xl font-extrabold text-[#0e0f0f] mt-1">
                  Profiling ng Hard Skills &amp; Educational Attainment
                </h2>
                <p className="text-xs text-[#74777e] mt-1">
                  I-dokumento ang iyong mga natatanging kakayahan, kurso, at pinag-aralan upang magamit sa pagpaplano ng mga proyekto ng konseho.
                </p>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saveLoading}
                className="px-5 py-2.5 bg-[#ba0c00] hover:bg-[#920a00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                {saveLoading ? 'Nai-save...' : 'I-save ang Profile'}
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* Currently Active Skills */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#0e0f0f] uppercase tracking-wider">
                Iyong Mga Hard Skills ({skills.length}):
              </label>
              <div className="flex flex-wrap gap-2 p-3.5 bg-[#faf9fb] rounded-xl border border-[#efedf0] min-h-12">
                {skills.length === 0 ? (
                  <span className="text-xs text-[#74777e] italic">
                    Wala pang napipiling skills. Pumili mula sa suggested skills sa ibaba.
                  </span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#242424] text-white shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((s) => s !== skill))}
                        className="hover:text-red-300 cursor-pointer"
                        title="Alisin"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Suggested Skills Selector */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#74777e] uppercase tracking-wider">
                Mabilis na Pagpili ng Skills (I-click upang i-toggle):
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.map((item) => {
                  const active = skills.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        if (active) {
                          setSkills(skills.filter((s) => s !== item));
                        } else {
                          setSkills([...skills, item]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${active
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#efedf0] text-[#43474d] hover:bg-neutral-200'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {active ? 'check' : 'add'}
                      </span>
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Skill */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Maglagay ng ibang kakaibang skill (hal. Drone Operation, Sign Language, DRRM First Responder)..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const trimmed = customSkillInput.trim();
                    if (trimmed && !skills.includes(trimmed)) {
                      setSkills([...skills, trimmed]);
                      setCustomSkillInput('');
                    }
                  }
                }}
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#c4c6ce] text-xs outline-none focus:border-[#ba0c00]"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = customSkillInput.trim();
                  if (trimmed && !skills.includes(trimmed)) {
                    setSkills([...skills, trimmed]);
                    setCustomSkillInput('');
                  }
                }}
                className="px-4 py-2.5 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Idagdag
              </button>
            </div>

            {/* Educational Attainment Section */}
            <div className="pt-4 border-t border-[#efedf0] space-y-4">
              <h3 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                Impormasyon sa Edukasyon
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Antas ng Pinag-aralan
                  </label>
                  <select
                    value={educationalAttainment}
                    onChange={(e) => setEducationalAttainment(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs font-medium focus:border-[#ba0c00] cursor-pointer"
                  >
                    {EDUCATIONAL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Kurso / Programa / Strand
                  </label>
                  <input
                    type="text"
                    value={educationDegree}
                    onChange={(e) => setEducationDegree(e.target.value)}
                    placeholder="Hal. BS Information Technology"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs focus:border-[#ba0c00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Paaralan / Pamantasan
                  </label>
                  <input
                    type="text"
                    value={educationSchool}
                    onChange={(e) => setEducationSchool(e.target.value)}
                    placeholder="Hal. Taguig City University"
                    className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs focus:border-[#ba0c00]"
                  />
                </div>
              </div>
            </div>

            {/* Youth Advocacy */}
            <div className="pt-4 border-t border-[#efedf0] space-y-2">
              <label className="block text-xs font-bold text-[#0e0f0f] uppercase">
                Youth Advocacy &amp; Personal Mission Statement
              </label>
              <textarea
                rows={3}
                value={bioAdvocacy}
                onChange={(e) => setBioAdvocacy(e.target.value)}
                className="w-full p-3 bg-white border border-[#c4c6ce] rounded-lg text-xs focus:border-[#ba0c00] outline-none"
                placeholder="Isulat ang iyong pananaw at ipinaglalabang adbokasiya para sa kabataan ng iyong barangay..."
              />
            </div>
          </div>
        )}

        {/* TAB: Measures (Opsyonal) */}
        {activeTab === 'measures' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#efedf0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#ba0c00] uppercase tracking-wider block">
                    Legislative Performance Record
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Opsyonal
                  </span>
                </div>
                <h3 className="font-['Poppins'] text-xl font-bold text-[#0e0f0f] mt-0.5">
                  Authored Measures &amp; Passed Resolutions ({measures.length})
                </h3>
                <p className="text-xs text-[#74777e] mt-0.5">
                  Opsyonal na talaan ng mga naipasang ordinansa o resolusyon sa konseho.
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
              <div className="text-center py-12 text-xs text-[#74777e] p-6 bg-[#faf9fb] rounded-xl border border-dashed border-[#efedf0]">
                Walang nakatalang resolusyon sa kasalukuyan. (Opsyonal na bahagi ng profile).
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
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.status === 'passed' || m.status === 'adopted' || m.status === 'enacted'
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
        )}

        {/* TAB: Treasury / Budget Desk (For Treasurer) */}
        {activeTab === 'treasury' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm space-y-6">
            <div className="border-b border-[#efedf0] pb-4">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                SK Treasurer Custody
              </span>
              <h2 className="font-['Poppins'] text-2xl font-extrabold text-[#0e0f0f] mt-1">
                Budget &amp; Fiscal Transparency Desk
              </h2>
              <p className="text-xs text-[#74777e] mt-1">
                Subaybayan ang 10% SK Barangay Youth Investment Fund alinsunod sa COA at DILG guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">ABYIP Allocation</span>
                <span className="font-['Poppins'] text-2xl font-extrabold text-emerald-900 mt-1 block">₱1,250,000</span>
                <span className="text-[11px] text-emerald-700">10% Statutory SK Fund</span>
              </div>
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Disbursed Projects</span>
                <span className="font-['Poppins'] text-2xl font-extrabold text-blue-900 mt-1 block">₱940,000</span>
                <span className="text-[11px] text-blue-700">75.2% Utilization Rate</span>
              </div>
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200">
                <span className="text-[10px] uppercase font-bold text-purple-800 block">Financial Transparency</span>
                <span className="font-['Poppins'] text-2xl font-extrabold text-purple-900 mt-1 block">100%</span>
                <span className="text-[11px] text-purple-700">Full Public Disclosure Posted</span>
              </div>
            </div>

            <div className="p-4 bg-[#faf9fb] rounded-xl border border-[#efedf0] space-y-2">
              <h4 className="text-xs font-bold text-[#0e0f0f]">Mandatory Fiscal Checkpoints:</h4>
              <ul className="text-xs text-[#43474d] space-y-1.5 list-disc pl-5">
                <li>Annual Barangay Youth Investment Program (ABYIP) duly adopted.</li>
                <li>Fidelity Bond obtained with the Bureau of the Treasury (BTr).</li>
                <li>All checks co-signed by the SK Chairperson and SK Treasurer.</li>
                <li>Quarterly Financial Reports submitted to COA and DILG field offices.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB: Committee Desk (For Kagawad) */}
        {activeTab === 'committee' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm space-y-6">
            <div className="border-b border-[#efedf0] pb-4">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                SK Kagawad Portfolio
              </span>
              <h2 className="font-['Poppins'] text-2xl font-extrabold text-[#0e0f0f] mt-1">
                Committee Portfolio &amp; Youth Advocacy Desk
              </h2>
              <p className="text-xs text-[#74777e] mt-1">
                Pamamahala sa itinalagang komite at pakikipag-ugnayan sa mga kabataan ng purok.
              </p>
            </div>

            <div className="p-5 bg-red-50/50 rounded-xl border border-red-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#ba0c00] block">Itinalagang Komite:</span>
              <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f]">
                {profile?.committee_assigned || 'Committee on Youth & Sports Development'}
              </h3>
              <p className="text-xs text-[#43474d] leading-relaxed">
                Tungkulin mong pamunuan ang mga deliberasyon, konsultasyon sa mga kabataan, at paghahanda ng mga panukala at programa para sa komiteng ito.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#faf9fb] rounded-xl border border-[#efedf0]">
                <span className="text-xs font-bold text-[#0e0f0f] block mb-1">Constituent Outreach</span>
                <p className="text-xs text-[#74777e]">
                  Makipag-ugnayan sa mga purok youth leaders at magsagawa ng konsultasyon kada buwan.
                </p>
              </div>
              <div className="p-4 bg-[#faf9fb] rounded-xl border border-[#efedf0]">
                <span className="text-xs font-bold text-[#0e0f0f] block mb-1">Katipunan ng Kabataan (KK) Hub</span>
                <p className="text-xs text-[#74777e]">
                  Magpanatili ng maayos na listahan ng mga aktibong kabataan sa iyong sakop na purok o sitio.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Federation Overview (For Admin - THE OVERVIEW LOOK) */}
        {activeTab === 'overview' && isSuperAdmin && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#efedf0] pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#ba0c00] bg-red-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Command Center Overview
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">• 38/38 Barangays Operational</span>
                  </div>
                  <h2 className="font-['Poppins'] text-2xl font-extrabold text-[#0e0f0f] mt-1">
                    Taguig City Sangguniang Kabataan Federation Matrix
                  </h2>
                  <p className="text-xs text-[#74777e] mt-1">
                    Pangkalahatang pagsubaybay sa lahat ng 38 barangay councils sa Distrito 1, Distrito 2, at Embo.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-sm text-[#74777e]">search</span>
                    <input
                      type="text"
                      placeholder="Maghanap ng Barangay..."
                      value={adminBarangaySearch}
                      onChange={(e) => setAdminBarangaySearch(e.target.value)}
                      className="pl-9 pr-3 py-2 bg-[#f5f3f6] rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#ba0c00] w-56"
                    />
                  </div>
                </div>
              </div>

              {/* 38 Barangays Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {TAGUIG_BARANGAYS.filter((b) =>
                  b.toLowerCase().includes(adminBarangaySearch.toLowerCase())
                ).map((brgy, idx) => {
                  const brgyOfficials = allOfficialsList.filter(
                    (o) => o.barangay_name.toLowerCase() === brgy.toLowerCase()
                  );
                  const chair = brgyOfficials.find((o) => o.position === 'chairperson');
                  const count = brgyOfficials.length > 0 ? brgyOfficials.length : 6;

                  return (
                    <div
                      key={brgy}
                      className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0] hover:border-[#ba0c00]/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold text-[#ba0c00] bg-red-50 px-2 py-0.5 rounded">
                            BRGY #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                            Active Council
                          </span>
                        </div>
                        <h4 className="font-['Poppins'] text-base font-bold text-[#0e0f0f] mt-1.5">
                          Barangay {brgy}
                        </h4>
                        <p className="text-xs text-[#43474d] mt-1">
                          <strong className="text-[#0e0f0f]">Chairperson:</strong>{' '}
                          {chair?.full_name || 'Hon. Council Chairperson'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#efedf0] flex items-center justify-between text-xs text-[#74777e]">
                        <span>{count} Registered Officials</span>
                        <Link
                          href={`/officials?barangay=${encodeURIComponent(brgy)}`}
                          className="text-[#ba0c00] font-bold hover:underline inline-flex items-center gap-0.5"
                        >
                          Tingnan &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Skills Analytics (For Admin) */}
        {activeTab === 'skills_analytics' && isSuperAdmin && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm space-y-6">
            <div className="border-b border-[#efedf0] pb-4">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Federation Competencies Analytics
              </span>
              <h2 className="font-['Poppins'] text-2xl font-extrabold text-[#0e0f0f] mt-1">
                Lungsod ng Taguig: SK Youth Skills Distribution
              </h2>
              <p className="text-xs text-[#74777e] mt-1">
                Talaan ng mga natipong kakayahan at antas ng edukasyon sa lahat ng 228 opisyal sa 38 barangay.
              </p>
            </div>

            {/* Top Skills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {portalStats?.skills_distribution &&
                Object.entries(portalStats.skills_distribution).map(([skillName, tally]) => (
                  <div
                    key={skillName}
                    className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-[#0e0f0f] leading-snug">{skillName}</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-lg font-['Poppins'] font-extrabold text-emerald-700">
                        {String(tally)}
                      </span>
                      <span className="text-[10px] text-[#74777e]">opisyal</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Education Attainment Distribution */}
            <div className="pt-4 border-t border-[#efedf0]">
              <h3 className="font-['Poppins'] text-base font-bold text-[#0e0f0f] mb-3">
                Educational Attainment Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {portalStats?.education_distribution &&
                  Object.entries(portalStats.education_distribution).map(([level, count]) => (
                    <div key={level} className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
                      <span className="text-[11px] font-bold text-amber-900 block">{level}</span>
                      <span className="text-2xl font-['Poppins'] font-extrabold text-[#0e0f0f] mt-1 block">
                        {String(count)} Opisyal
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Council Roster Overview */}
        {activeTab === 'council' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

                {/* Search & Filter Controls Group */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Input Box */}
                  <div className="relative flex-1 sm:w-60 min-w-[200px]">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-[#74777e]">
                      search
                    </span>
                    <input
                      type="text"
                      value={councilSearch}
                      onChange={(e) => setCouncilSearch(e.target.value)}
                      placeholder="Maghanap ng opisyal, komite..."
                      className="w-full h-10 pl-9 pr-8 bg-[#f5f3f6] focus:bg-white text-xs text-[#0e0f0f] rounded-xl border border-[#efedf0] focus:border-[#ba0c00] outline-none transition-all placeholder:text-[#74777e]"
                    />
                    {councilSearch && (
                      <button
                        type="button"
                        onClick={() => setCouncilSearch('')}
                        className="absolute right-2.5 top-2.5 text-[#74777e] hover:text-[#0e0f0f] cursor-pointer"
                        title="I-clear"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>

                  {/* Position Filter Dropdown */}
                  <div className="relative w-40 sm:w-44">
                    <select
                      value={councilRoleFilter}
                      onChange={(e) => setCouncilRoleFilter(e.target.value)}
                      className="w-full h-10 pl-3 pr-8 bg-[#f5f3f6] focus:bg-white text-xs font-semibold text-[#0e0f0f] rounded-xl border border-[#efedf0] focus:border-[#ba0c00] outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">Lahat ng Posisyon</option>
                      <option value="chairperson">SK Chairperson</option>
                      <option value="kagawad">SK Kagawad</option>
                      <option value="secretary">SK Secretary</option>
                      <option value="treasurer">SK Treasurer</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-base text-[#74777e] pointer-events-none">
                      expand_more
                    </span>
                  </div>

                  {/* Purok Filter (if multiple puroks exist) */}
                  {availablePuroks.length > 1 && (
                    <div className="relative w-36">
                      <select
                        value={councilPurokFilter}
                        onChange={(e) => setCouncilPurokFilter(e.target.value)}
                        className="w-full h-10 pl-3 pr-8 bg-[#f5f3f6] focus:bg-white text-xs font-semibold text-[#0e0f0f] rounded-xl border border-[#efedf0] focus:border-[#ba0c00] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="all">Lahat ng Purok</option>
                        {availablePuroks.map((purok) => (
                          <option key={purok} value={purok}>{purok}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-base text-[#74777e] pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  )}

                  {isChairOrAdmin && (
                    <button
                      onClick={() => setActiveTab('invite')}
                      className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#ba0c00] hover:bg-[#e81100] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-sm">add_link</span>
                      <span className="hidden sm:inline">Invite Official</span>
                      <span className="sm:hidden">Invite</span>
                    </button>
                  )}
                </div>
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
              ) : filteredCouncilOfficials.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#74777e] bg-[#faf9fb] rounded-xl border border-[#efedf0] mt-6 space-y-2">
                  <span className="material-symbols-outlined text-3xl text-[#74777e]">search_off</span>
                  <p className="font-semibold text-[#0e0f0f]">Walang natagpuang opisyal na tumutugma sa search o filter.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCouncilSearch('');
                      setCouncilRoleFilter('all');
                      setCouncilPurokFilter('all');
                    }}
                    className="text-xs text-[#ba0c00] font-bold hover:underline cursor-pointer"
                  >
                    I-clear ang search at filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {filteredCouncilOfficials.map((officer) => (
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
                    </div>
                  ))}
                </div>
              )}
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
                    className={`w-full h-11 px-3 rounded-lg text-sm transition-all ${canEditDemographics
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
                    className={`w-full h-11 px-3 rounded-lg text-sm transition-all ${canEditDemographics
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
                    className={`w-full h-11 px-3 rounded-lg text-sm transition-all ${canEditDemographics
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
                    className={`w-full h-11 px-3 rounded-lg text-sm transition-all ${canEditDemographics
                      ? 'bg-white text-[#1b1c1e] border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00]'
                      : 'bg-[#f5f3f6] text-[#74777e] border border-[#e2e4ea] cursor-not-allowed select-none'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                    Nickname
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
                    className={`w-full h-11 px-3 rounded-lg text-sm transition-all ${canEditDemographics
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
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${m.status === 'passed' || m.status === 'adopted' || m.status === 'enacted'
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
                        className={`w-full h-11 px-3 rounded-lg text-sm transition-all font-mono font-bold ${canEditDemographics
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
                  <span>TERM: {(settings.current_term_label || '2023 - 2026').replace(/^Term\s*/i, '')}</span>
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
              <span>TERM: {(settings.current_term_label || '2023 - 2026').replace(/^Term\s*/i, '')}</span>
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
