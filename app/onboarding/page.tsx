'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import OfficialNavbar from '@/components/layout/official-navbar';
import { TAGUIG_BARANGAYS, SUGGESTED_SKILLS, EDUCATIONAL_LEVELS, SK_COMMITTEES } from '@/lib/constants';
import useSystemSettings from '@/hooks/use-system-settings';

export default function OnboardingPage() {
  const router = useRouter();
  const { settings, isLoading: settingsLoading } = useSystemSettings();

  // 1. Account Credentials
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2. Personal Information
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthdate, setBirthdate] = useState('2002-01-15');
  const [contactNumber, setContactNumber] = useState('');

  // 3. Council Assignment & Term
  const [barangayName, setBarangayName] = useState<string>(TAGUIG_BARANGAYS[8]); // Default: Fort Bonifacio
  const [purokSitio, setPurokSitio] = useState('');
  const [position, setPosition] = useState<'chairperson' | 'kagawad' | 'secretary' | 'treasurer'>('kagawad');
  const [committeeAssigned, setCommitteeAssigned] = useState<string>(SK_COMMITTEES[3]);
  const [termStart, setTermStart] = useState('2023-11-01');
  const [termEnd, setTermEnd] = useState('2026-11-01');
  const [skmtCompliant, setSkmtCompliant] = useState(false);

  // Sync dates when settings load
  useEffect(() => {
    if (settings.term_start_date) setTermStart(settings.term_start_date);
    if (settings.term_end_date) setTermEnd(settings.term_end_date);
  }, [settings.term_start_date, settings.term_end_date]);

  // 4. Educational Attainment
  const [educationalAttainment, setEducationalAttainment] = useState<string>(EDUCATIONAL_LEVELS[4]);
  const [educationDegree, setEducationDegree] = useState('BS Information Technology');
  const [educationSchool, setEducationSchool] = useState('Taguig City University');

  // 5. Skills Profiling
  const [skills, setSkills] = useState<string[]>([
    'Project Management',
    'Youth Leadership',
    'Event Organizing',
  ]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // 6. Advocacy & Bio
  const [bioAdvocacy, setBioAdvocacy] = useState(
    'Advancing youth empowerment, inclusive community activities, and good governance in our barangay.'
  );

  // Form Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError('Hindi magkatugma ang Password at Confirm Password.');
      return;
    }

    if (skills.length === 0) {
      setError('Pumili ng kahit isang Hard Skill o Competency para sa iyong profile.');
      return;
    }

    if (settings.skmt_enforcement && !skmtCompliant) {
      setError('Kinakailangan ang pagkumpleto ng DILG Sangguniang Kabataan Mandatory Training (SKMT) sang-ayon sa patakaran ng pamunuan.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/auth/register', {
        email,
        username,
        password,
        password_confirmation: passwordConfirmation,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix,
        nickname,
        gender,
        birthdate,
        contact_number: contactNumber,
        barangay_name: barangayName,
        purok_sitio: purokSitio,
        position,
        committee_assigned: committeeAssigned,
        term_start: termStart,
        term_end: termEnd,
        educational_attainment: educationalAttainment,
        education_degree: educationDegree,
        education_school: educationSchool,
        skills,
        bio_advocacy: bioAdvocacy,
        skmt_compliant: skmtCompliant,
      });

      if (res.data?.success && res.data?.data?.token) {
        const { token, user } = res.data.data;
        const grantedTimeout = res.data.data.session_timeout_minutes || settings.session_timeout_minutes || 480;
        const expiresAt = Date.now() + grantedTimeout * 60 * 1000;
        localStorage.setItem('sk_token', token);
        localStorage.setItem('sk_user', JSON.stringify(user));
        localStorage.setItem('sk_session_expires_at', expiresAt.toString());
        localStorage.setItem('sk_session_timeout_mins', grantedTimeout.toString());
        window.dispatchEvent(new Event('sk_auth_changed'));

        // Flow: Login > Profile
        router.push('/dashboard');
      } else {
        setError(res.data?.message || 'Bigo ang pag-rehistro. Pakisuri ang impormasyon.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'May naganap na error sa pag-rehistro.';
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstErrorKey = Object.keys(errors)[0];
        setError(`${msg}: ${errors[firstErrorKey][0]}`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!settingsLoading && !settings.allow_public_onboarding) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9fb] text-[#1b1c1e] font-sans">
        <OfficialNavbar />
        <main className="flex-1 max-w-[640px] mx-auto w-full px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#efedf0] shadow-xl space-y-6 w-full">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <div className="space-y-2">
              <h1 className="font-['Poppins'] text-2xl font-bold text-[#0e0f0f]">
                Pansamantalang Sarado ang Online Onboarding
              </h1>
              <p className="text-sm text-[#74777e] leading-relaxed">
                Ang online self-registration para sa mga opisyal ng Sangguniang Kabataan ay kasalukuyang nakasara ayon sa itinakdang patakaran ng Super Administrator.
              </p>
            </div>
            <div className="p-4 bg-[#faf9fb] rounded-xl border border-[#efedf0] text-xs text-[#43474d] text-left space-y-1.5">
              <div className="font-bold text-[#0e0f0f]">Paano magkaroon ng opisyal na access:</div>
              <p>• Makipag-ugnayan sa inyong SK Chairperson upang maipadala ang inyong opisyal na Invite Link.</p>
              <p>• O sumangguni sa Federation Secretariat o Super Administrator para sa direktang provisioning.</p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#242424] hover:bg-[#ba0c00] text-white font-bold text-xs font-['Poppins'] transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Bumalik sa Login
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9fb] text-[#1b1c1e] font-sans">
      <OfficialNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#74777e] mb-2">
            <Link href="/login" className="hover:text-[#ba0c00]">Login</Link>
            <span>/</span>
            <span className="text-[#0e0f0f]">SK Official Onboarding & Profiling</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-[#0e0f0f] tracking-tight">
                Official Registration & Profile Intake
              </h1>
              <p className="text-sm text-[#74777e] mt-1">
                Mag-onboard bilang halal o hinirang na opisyal ng Sangguniang Kabataan sa alinman sa 38 Barangay ng Taguig.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="px-3 py-1 bg-red-50 text-[#ba0c00] border border-red-200 rounded-full text-xs font-bold">
                RA 10742 SK Reform Act
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                Taguig SK Portal
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <span className="material-symbols-outlined text-rose-600 shrink-0">error</span>
            <div className="flex-1">
              <p className="font-bold">Hindi Maipagpatuloy ang Pag-rehistro</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Account Credentials */}
          <section className="bg-white rounded-2xl border border-[#efedf0] shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#efedf0]">
              <div className="w-10 h-10 rounded-xl bg-[#242424] text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">manage_accounts</span>
              </div>
              <div>
                <h2 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                  1. Account Credentials & Login
                </h2>
                <p className="text-xs text-[#74777e]">Gagamitin mo ito sa pag-login sa Council Desk</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="juan.delacruz@skportal.gov.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  Desired Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="juandelacruz"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  Password (min. 8 characters) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#74777e] hover:text-[#0e0f0f]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card 2: Personal Profile */}
          <section className="bg-white rounded-2xl border border-[#efedf0] shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#efedf0]">
              <div className="w-10 h-10 rounded-xl bg-[#ba0c00] text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">badge</span>
              </div>
              <div>
                <h2 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                  2. Personal Identity & Contact Information
                </h2>
                <p className="text-xs text-[#74777e]">Opisyal na pangalan na lalabas sa iyong Digital SK ID Pass</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Hal. Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">Middle Name</label>
                <input
                  type="text"
                  placeholder="Hal. Ramos"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Hal. Dela Cruz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">Suffix (Jr., III, atbp.)</label>
                <input
                  type="text"
                  placeholder="Opsyonal"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">Nickname / Palayaw</label>
                <input
                  type="text"
                  placeholder="Hal. Johnny"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">Kasarian (Gender)</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] bg-white outline-none cursor-pointer"
                >
                  <option value="male">Male (Lalaki)</option>
                  <option value="female">Female (Babae)</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  Birthdate (Araw ng Kapanganakan)
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] bg-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  Mobile Contact Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0917-123-4567"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card 3: Council Assignment & Barangay */}
          <section className="bg-white rounded-2xl border border-[#efedf0] shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#efedf0]">
              <div className="w-10 h-10 rounded-xl bg-[#242424] text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">location_city</span>
              </div>
              <div>
                <h2 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                  3. Barangay Council Designation & Term
                </h2>
                <p className="text-xs text-[#74777e]">Piliin ang iyong Barangay (Lahat ng 38 Barangay ng Lungsod ng Taguig)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  Barangay Jurisdiction <span className="text-rose-500">*</span>
                </label>
                <select
                  value={barangayName}
                  onChange={(e) => setBarangayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] bg-white outline-none font-semibold cursor-pointer"
                >
                  {TAGUIG_BARANGAYS.map((brgy) => (
                    <option key={brgy} value={brgy}>
                      Barangay {brgy}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#74777e] mt-1">
                  Sumasaklaw sa lahat ng 38 barangay (Distrito 1, Distrito 2, at Embo)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">Purok / Sitio</label>
                <input
                  type="text"
                  placeholder="Hal. Purok 4 - Pagkakaisa"
                  value={purokSitio}
                  onChange={(e) => setPurokSitio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  SK Council Position <span className="text-rose-500">*</span>
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] bg-white outline-none font-bold cursor-pointer"
                >
                  <option value="chairperson">SK Chairperson (Pangulo ng Sangguniang Kabataan)</option>
                  <option value="kagawad">SK Kagawad (Konsehal ng Kabataan)</option>
                  <option value="secretary">SK Secretary (Kalihim)</option>
                  <option value="treasurer">SK Treasurer (Ingat-Yaman)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  Committee Assigned
                </label>
                <select
                  value={committeeAssigned}
                  onChange={(e) => setCommitteeAssigned(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] bg-white outline-none cursor-pointer"
                >
                  {SK_COMMITTEES.map((comm) => (
                    <option key={comm} value={comm}>
                      {comm}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">Term Start</label>
                <input
                  type="date"
                  value={termStart}
                  onChange={(e) => setTermStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">Term End</label>
                <input
                  type="date"
                  value={termEnd}
                  onChange={(e) => setTermEnd(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] bg-white outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card 4: Educational Attainment */}
          <section className="bg-white rounded-2xl border border-[#efedf0] shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#efedf0]">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">school</span>
              </div>
              <div>
                <h2 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                  4. Educational Attainment (Edukasyon)
                </h2>
                <p className="text-xs text-[#74777e]">Antas ng pinag-aralan, kurso, at paaralan</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  Educational Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={educationalAttainment}
                  onChange={(e) => setEducationalAttainment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] bg-white outline-none font-medium cursor-pointer"
                >
                  {EDUCATIONAL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  Degree / Program / Strand
                </label>
                <input
                  type="text"
                  placeholder="Hal. BS Information Technology / HUMSS"
                  value={educationDegree}
                  onChange={(e) => setEducationDegree(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474d] mb-1.5">
                  School / University
                </label>
                <input
                  type="text"
                  placeholder="Hal. Taguig City University"
                  value={educationSchool}
                  onChange={(e) => setEducationSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card 5: Profiling ng Skills (Hard Skills & Core Competencies) */}
          <section className="bg-white rounded-2xl border border-[#efedf0] shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#efedf0]">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">psychology</span>
              </div>
              <div>
                <h2 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                  5. Profiling ng Hard Skills & Competencies
                </h2>
                <p className="text-xs text-[#74777e]">
                  Piliin ang iyong mga kakayahan at hard skills upang magamit sa tamang komite at proyekto
                </p>
              </div>
            </div>

            {/* Currently Selected Skills */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#43474d] mb-2">
                Naitagang Skills ({skills.length}):
              </label>
              <div className="flex flex-wrap gap-2 min-h-11 p-3 rounded-xl bg-[#faf9fb] border border-[#efedf0]">
                {skills.length === 0 ? (
                  <span className="text-xs text-[#74777e] italic">
                    Wala pang napipiling skills. Mag-click sa listahan sa ibaba o mag-type ng sarili.
                  </span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ba0c00] text-white shadow-xs animate-in zoom-in-95 duration-100"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-200 cursor-pointer"
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
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#74777e] mb-2 uppercase tracking-wider">
                Mabilis na Pagpili (Click to toggle):
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.map((item) => {
                  const active = skills.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleSkill(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${active
                          ? 'bg-[#242424] text-white shadow-xs'
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

            {/* Custom Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Magdagdag ng ibang natatanging hard skill (hal. Drone Piloting, First Aid BLS, atbp.)..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={handleAddCustomSkill}
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#c8c6c5] focus:border-[#ba0c00] text-sm outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-4 py-2.5 rounded-lg bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Idagdag
              </button>
            </div>
          </section>

          {/* Card 6: Youth Advocacy & Bio */}
          <section className="bg-white rounded-2xl border border-[#efedf0] shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#efedf0]">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">volunteer_activism</span>
              </div>
              <div>
                <h2 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                  6. Youth Advocacy & Personal Mission
                </h2>
                <p className="text-xs text-[#74777e]">Mensahe o adhikain para sa mga kabataan ng iyong barangay</p>
              </div>
            </div>

            <div>
              <textarea
                rows={4}
                value={bioAdvocacy}
                onChange={(e) => setBioAdvocacy(e.target.value)}
                placeholder="Isulat ang iyong adbokasiya para sa kabataan (hal. libreng tutorial, palakasan, mental health awareness, atbp.)..."
                className="w-full p-3.5 rounded-xl border border-[#c8c6c5] focus:border-[#ba0c00] focus:ring-1 focus:ring-[#ba0c00] text-sm text-[#0e0f0f] outline-none"
              />
            </div>
          </section>

          {/* Card 7: DILG SKMT Compliance Verification */}
          {settings.skmt_enforcement && (
            <section className="bg-white rounded-2xl border border-[#efedf0] shadow-sm p-6 sm:p-8 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#efedf0]">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">verified</span>
                </div>
                <div>
                  <h2 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                    7. DILG SKMT Compliance Verification
                  </h2>
                  <p className="text-xs text-[#74777e]">Pagsunod sa Republic Act No. 10742 (SK Reform Act)</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={skmtCompliant}
                    onChange={(e) => setSkmtCompliant(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-[#ba0c00] rounded cursor-pointer shrink-0"
                  />
                  <div className="text-xs text-[#0e0f0f]">
                    <span className="font-bold block text-sm">
                      Ako ay nakakumpleto ng Sangguniang Kabataan Mandatory Training (SKMT) <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[#74777e] mt-1 block">
                      Alinsunod sa umiiral na regulasyon ng DILG at ng Federation, ang bawat opisyal ay kailangang makapasa sa mandatory training.
                    </span>
                  </div>
                </label>
              </div>
            </section>
          )}

          {/* Submit Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/login"
              className="text-xs font-bold text-[#74777e] hover:text-[#0e0f0f] transition-colors"
            >
              Mayroon nang account? Mag-sign in dito
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#ba0c00] hover:bg-[#920a00] text-white rounded-xl font-['Poppins'] font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Nire-rehistro ang Profile...</span>
                </>
              ) : (
                <>
                  <span>Kumpletuhin ang Onboarding & Buksan ang Profile</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

