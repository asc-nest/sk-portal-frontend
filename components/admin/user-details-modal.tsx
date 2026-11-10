'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';
import { TAGUIG_BARANGAYS, SUGGESTED_SKILLS, EDUCATIONAL_LEVELS, SK_COMMITTEES } from '@/lib/constants';

interface UserDetailsModalProps {
  userId: number;
  onClose: () => void;
  onUserUpdated: () => void;
}

export default function UserDetailsModal({
  userId,
  onClose,
  onUserUpdated,
}: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'security' | 'roles' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // User payload
  const [userData, setUserData] = useState<any>(null);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);

  // Editable Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [nickname, setNickname] = useState('');
  const [barangayName, setBarangayName] = useState('');
  const [position, setPosition] = useState('kagawad');
  const [committeeAssigned, setCommitteeAssigned] = useState('');
  const [termStart, setTermStart] = useState('');
  const [termEnd, setTermEnd] = useState('');
  const [educationalAttainment, setEducationalAttainment] = useState('');
  const [educationDegree, setEducationDegree] = useState('');
  const [educationSchool, setEducationSchool] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [bioAdvocacy, setBioAdvocacy] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [skmtCompliant, setSkmtCompliant] = useState(true);

  // Security action states
  const [suspensionReason, setSuspensionReason] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get(`/admin/users/${userId}`);
        if (res.data?.success && res.data?.data) {
          const user = res.data.data.user;
          setUserData(user);
          setActivityHistory(res.data.data.activity_history || []);
          setAllPermissions(res.data.data.all_permissions || []);

          // Initialize fields
          setName(user.name || '');
          setEmail(user.email || '');
          setUsername(user.username || '');
          setMobileNumber(user.mobile_number || '');

          const roles = user.roles ? user.roles.map((r: any) => r.name) : [];
          setSelectedRoles(roles);

          const prof = user.official_profile;
          if (prof) {
            setFirstName(prof.first_name || '');
            setMiddleName(prof.middle_name || '');
            setLastName(prof.last_name || '');
            setSuffix(prof.suffix || '');
            setNickname(prof.nickname || '');
            setBarangayName(prof.barangay_name || '');
            setPosition(prof.position || 'kagawad');
            setCommitteeAssigned(prof.committee_assigned || '');
            setTermStart(prof.term_start ? prof.term_start.split('T')[0] : '2023-11-01');
            setTermEnd(prof.term_end ? prof.term_end.split('T')[0] : '2026-11-01');
            setEducationalAttainment(prof.educational_attainment || '');
            setEducationDegree(prof.education_degree || '');
            setEducationSchool(prof.education_school || '');
            setSkills(Array.isArray(prof.skills) ? prof.skills : []);
            setBioAdvocacy(prof.bio_advocacy || '');
            setBloodType(prof.blood_type || '');
            setCivilStatus(prof.civil_status || '');
            setSkmtCompliant(prof.skmt_compliant ?? true);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load user profile details.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserDetails();
  }, [userId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await apiClient.put(`/admin/users/${userId}`, {
        name,
        email,
        username,
        mobile_number: mobileNumber,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix,
        nickname,
        barangay_name: barangayName,
        position,
        committee_assigned: committeeAssigned,
        term_start: termStart,
        term_end: termEnd,
        educational_attainment: educationalAttainment,
        education_degree: educationDegree,
        education_school: educationSchool,
        skills,
        bio_advocacy: bioAdvocacy,
        blood_type: bloodType,
        civil_status: civilStatus,
        skmt_compliant: skmtCompliant,
      });

      if (res.data?.success) {
        setSuccess('Profile successfully updated and logged in audit trail.');
        onUserUpdated();
        setTimeout(() => setSuccess(null), 3500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!userData) return;
    const targetStatus = !userData.is_active;
    const actionWord = targetStatus ? 'activate' : 'suspend';

    if (!confirm(`Are you sure you want to ${actionWord} this account?`)) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const res = await apiClient.patch(`/admin/users/${userId}/status`, {
        is_active: targetStatus,
        reason: suspensionReason || undefined,
      });

      if (res.data?.success) {
        setUserData((prev: any) => ({ ...prev, is_active: targetStatus }));
        setSuccess(`Account has been ${targetStatus ? 'activated' : 'suspended'}.`);
        onUserUpdated();
        setTimeout(() => setSuccess(null), 3500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${actionWord} user.`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const res = await apiClient.post(`/admin/users/${userId}/reset-password`, {
        new_password: newPassword,
      });

      if (res.data?.success) {
        setSuccess('Password has been securely reset. Active sessions revoked.');
        setShowPasswordResetModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRoles = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await apiClient.put(`/admin/users/${userId}/roles`, {
        roles: selectedRoles,
      });

      if (res.data?.success) {
        setSuccess('Assigned roles updated successfully.');
        onUserUpdated();
        setTimeout(() => setSuccess(null), 3500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update roles.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#ba0c00] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-[#43474d]">Loading Official Records...</span>
        </div>
      </div>
    );
  }

  const roleName = selectedRoles[0]?.replace('sk_', '').toUpperCase() || 'OFFICIAL';
  const officialId = userData?.official_profile?.official_id_number || `SK-${userData?.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-[#efedf0] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#1b1c1e] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-[#ba0c00]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ba0c00] flex items-center justify-center text-white font-['Poppins'] font-extrabold text-xl shadow-md shrink-0">
              {userData?.official_profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userData.official_profile.avatar_url}
                  alt={userData.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                userData?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'SK'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase font-mono">
                  {officialId}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    userData?.is_active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {userData?.is_active ? 'Active Account' : 'Suspended'}
                </span>
              </div>
              <h2 className="font-['Poppins'] text-lg sm:text-xl font-bold text-white mt-1">
                {userData?.name}
              </h2>
              <p className="text-xs text-[#c8c6c5]">
                {userData?.email} • {userData?.official_profile?.barangay_name || 'Taguig City'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="self-end sm:self-auto p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#efedf0] bg-[#faf9fb] overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#ba0c00] text-[#ba0c00]'
                : 'border-transparent text-[#74777e] hover:text-[#0e0f0f]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">badge</span>
            Overview & Assignment
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`px-3.5 py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'personal'
                ? 'border-[#ba0c00] text-[#ba0c00]'
                : 'border-transparent text-[#74777e] hover:text-[#0e0f0f]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">person</span>
            Personal & Education
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-[#ba0c00] text-[#ba0c00]'
                : 'border-transparent text-[#74777e] hover:text-[#0e0f0f]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">lock</span>
            Security & Status
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3.5 py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'roles'
                ? 'border-[#ba0c00] text-[#ba0c00]'
                : 'border-transparent text-[#74777e] hover:text-[#0e0f0f]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">shield_person</span>
            RBAC Roles
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3.5 py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'activity'
                ? 'border-[#ba0c00] text-[#ba0c00]'
                : 'border-transparent text-[#74777e] hover:text-[#0e0f0f]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">history</span>
            Audit History
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600 text-base">error</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        {/* Scrollable Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Overview & Council Assignment */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0]">
                  <span className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider block mb-1">
                    Barangay Jurisdiction
                  </span>
                  <select
                    value={barangayName}
                    onChange={(e) => setBarangayName(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs font-semibold text-[#0e0f0f] outline-none focus:border-[#ba0c00]"
                  >
                    {TAGUIG_BARANGAYS.map((b) => (
                      <option key={b} value={b}>
                        Barangay {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0]">
                  <span className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider block mb-1">
                    Council Position
                  </span>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs font-semibold text-[#0e0f0f] outline-none focus:border-[#ba0c00]"
                  >
                    <option value="chairperson">SK Chairperson</option>
                    <option value="secretary">SK Secretary</option>
                    <option value="treasurer">SK Treasurer</option>
                    <option value="kagawad">SK Kagawad (Councilor)</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0] space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider block">
                  Committee Assignment
                </span>
                <input
                  type="text"
                  value={committeeAssigned}
                  onChange={(e) => setCommitteeAssigned(e.target.value)}
                  placeholder="e.g. Committee on Youth & Sports Development"
                  className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs text-[#0e0f0f] outline-none focus:border-[#ba0c00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider block mb-1">
                    Term Start
                  </label>
                  <input
                    type="date"
                    value={termStart}
                    onChange={(e) => setTermStart(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs text-[#0e0f0f] outline-none focus:border-[#ba0c00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider block mb-1">
                    Term End
                  </label>
                  <input
                    type="date"
                    value={termEnd}
                    onChange={(e) => setTermEnd(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs text-[#0e0f0f] outline-none focus:border-[#ba0c00]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider block">
                  Youth Advocacy Statement / Bio
                </label>
                <textarea
                  rows={3}
                  value={bioAdvocacy}
                  onChange={(e) => setBioAdvocacy(e.target.value)}
                  placeholder="Official youth development advocacy..."
                  className="w-full p-3 bg-white border border-[#c4c6ce] rounded-lg text-xs text-[#0e0f0f] outline-none focus:border-[#ba0c00]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Personal Information & Education */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">Nickname</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="0917XXXXXXX"
                    className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">Blood Type</label>
                  <input
                    type="text"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    placeholder="e.g. O+, A+"
                    className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                  />
                </div>
              </div>

              {/* Education */}
              <div className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0] space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider block">
                  Educational Attainment
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#43474d] block mb-1">Attainment Level</label>
                    <select
                      value={educationalAttainment}
                      onChange={(e) => setEducationalAttainment(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                    >
                      <option value="">Select Level</option>
                      {EDUCATIONAL_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#43474d] block mb-1">Degree / Strand</label>
                    <input
                      type="text"
                      value={educationDegree}
                      onChange={(e) => setEducationDegree(e.target.value)}
                      placeholder="e.g. BS Information Technology"
                      className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#43474d] block mb-1">School / University</label>
                    <input
                      type="text"
                      value={educationSchool}
                      onChange={(e) => setEducationSchool(e.target.value)}
                      placeholder="e.g. Taguig City University"
                      className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                    />
                  </div>
                </div>
              </div>

              {/* Skills Profiling */}
              <div className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider">
                    Profiled Skills &amp; Competencies ({skills.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.map((sk) => {
                    const has = skills.includes(sk);
                    return (
                      <button
                        type="button"
                        key={sk}
                        onClick={() => toggleSkill(sk)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          has
                            ? 'bg-[#ba0c00] text-white shadow-xs'
                            : 'bg-white border border-[#c4c6ce] text-[#43474d] hover:bg-gray-100'
                        }`}
                      >
                        {sk} {has && '✓'}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add custom hard skill..."
                    className="flex-1 h-9 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-4 bg-[#242424] hover:bg-[#ba0c00] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Status */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Account Status Card */}
              <div className="p-5 rounded-2xl border border-[#efedf0] bg-[#faf9fb] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f]">
                      Account Access Status
                    </h4>
                    <p className="text-xs text-[#74777e]">
                      {userData?.is_active
                        ? 'This account has active authorization to access the council portal.'
                        : 'This account is currently SUSPENDED. All active login tokens are revoked.'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      userData?.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {userData?.is_active ? 'Active' : 'Suspended'}
                  </span>
                </div>

                {!userData?.is_active && (
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                      Reason for Suspension
                    </label>
                    <input
                      type="text"
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      placeholder="e.g. Council term ended or pending investigation..."
                      className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    disabled={saving}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      userData?.is_active
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {userData?.is_active ? 'Suspend Account' : 'Activate Account'}
                  </button>
                </div>
              </div>

              {/* Password Reset Card */}
              <div className="p-5 rounded-2xl border border-[#efedf0] bg-[#faf9fb] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f]">
                      Administrative Password Reset
                    </h4>
                    <p className="text-xs text-[#74777e]">
                      Directly provision a new encrypted password for this official.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordResetModal(!showPasswordResetModal)}
                    className="px-4 py-2 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {showPasswordResetModal ? 'Cancel' : 'Reset Password'}
                  </button>
                </div>

                {showPasswordResetModal && (
                  <form onSubmit={handleResetPassword} className="pt-3 border-t border-[#efedf0] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                          New Secure Password (min 8 chars)
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 bg-[#ba0c00] hover:bg-[#920a00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        {saving ? 'Updating...' : 'Commit New Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Roles & Permissions (RBAC) */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0] space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider block">
                  Assigned Spatie Role
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'sk_chairperson', label: 'SK Chairperson', desc: 'Council Executive & Presiding Officer' },
                    { id: 'sk_secretary', label: 'SK Secretary', desc: 'Secretariat, Roll Call, & Registries' },
                    { id: 'sk_treasurer', label: 'SK Treasurer', desc: 'Fiscal Operations & Budget Desk' },
                    { id: 'sk_kagawad', label: 'SK Kagawad', desc: 'Committee Leadership & Legislation' },
                    { id: 'super_admin', label: 'Super Administrator', desc: 'City-wide supervision & user control' },
                  ].map((r) => {
                    const selected = selectedRoles.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          selected
                            ? 'bg-red-50/50 border-[#ba0c00]'
                            : 'bg-white border-[#efedf0] hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            if (selected) {
                              setSelectedRoles(selectedRoles.filter((item) => item !== r.id));
                            } else {
                              setSelectedRoles([...selectedRoles, r.id]);
                            }
                          }}
                          className="mt-0.5 accent-[#ba0c00]"
                        />
                        <div>
                          <strong className="text-xs text-[#0e0f0f] block font-bold">{r.label}</strong>
                          <span className="text-[11px] text-[#74777e]">{r.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleUpdateRoles}
                    disabled={saving}
                    className="px-4 py-2 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {saving ? 'Updating Roles...' : 'Save Role Assignment'}
                  </button>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider block">
                  Effective Permissions Granted
                </span>
                <div className="flex flex-wrap gap-2">
                  {allPermissions.length > 0 ? (
                    allPermissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2.5 py-1 bg-white border border-[#c4c6ce] text-[#0e0f0f] text-xs rounded-lg font-mono flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">check</span>
                        {perm}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#74777e]">Standard role permissions active.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Activity History */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider block">
                Administrative Audit Logs
              </span>
              {activityHistory.length === 0 ? (
                <div className="p-8 text-center bg-[#faf9fb] rounded-xl border border-[#efedf0]">
                  <span className="material-symbols-outlined text-3xl text-[#74777e] block mb-1">history</span>
                  <p className="text-xs text-[#74777e]">No recorded modifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#efedf0] border border-[#efedf0] rounded-xl overflow-hidden bg-white">
                  {activityHistory.map((item) => (
                    <div key={item.id} className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f5f3f6] text-[#0e0f0f] font-mono">
                            {item.action}
                          </span>
                          <span className="text-[11px] text-[#74777e]">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#0e0f0f] mt-1 font-semibold">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-[#74777e]">
                        {item.ip_address || 'system'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Action Bar */}
        <div className="p-4 bg-[#faf9fb] border-t border-[#efedf0] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#c4c6ce] hover:bg-gray-100 text-[#0e0f0f] text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>

          {(activeTab === 'overview' || activeTab === 'personal') && (
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-2 bg-[#ba0c00] hover:bg-[#920a00] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

