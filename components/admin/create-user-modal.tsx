'use client';

import React, { useState } from 'react';
import apiClient from '@/lib/api/client';
import { TAGUIG_BARANGAYS, SUGGESTED_SKILLS, EDUCATIONAL_LEVELS, SK_COMMITTEES } from '@/lib/constants';

interface CreateUserModalProps {
  onClose: () => void;
  onUserCreated: () => void;
}

export default function CreateUserModal({
  onClose,
  onUserCreated,
}: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('CouncilPass123!');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState<'sk_chairperson' | 'sk_secretary' | 'sk_treasurer' | 'sk_kagawad' | 'super_admin'>('sk_kagawad');
  const [barangayName, setBarangayName] = useState<string>(TAGUIG_BARANGAYS[0]);
  const [position, setPosition] = useState<'chairperson' | 'secretary' | 'treasurer' | 'kagawad' | 'admin'>('kagawad');
  const [committeeAssigned, setCommitteeAssigned] = useState<string>(SK_COMMITTEES[0]);
  const [educationalAttainment, setEducationalAttainment] = useState<string>(EDUCATIONAL_LEVELS[4]);
  const [educationDegree, setEducationDegree] = useState('BS Information Technology');
  const [educationSchool, setEducationSchool] = useState('Taguig City University');
  const [skills, setSkills] = useState<string[]>(['Youth Leadership', 'Project Management']);
  const [bioAdvocacy, setBioAdvocacy] = useState('Championing youth development, sports, and inclusive community engagement.');

  // Synchronize role and position
  const handleRoleChange = (newRole: any) => {
    setRole(newRole);
    if (newRole === 'sk_chairperson') setPosition('chairperson');
    else if (newRole === 'sk_secretary') setPosition('secretary');
    else if (newRole === 'sk_treasurer') setPosition('treasurer');
    else if (newRole === 'sk_kagawad') setPosition('kagawad');
    else if (newRole === 'super_admin') setPosition('admin');
  };

  const toggleSkill = (sk: string) => {
    if (skills.includes(sk)) {
      setSkills(skills.filter((s) => s !== sk));
    } else {
      setSkills([...skills, sk]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !username.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.post('/admin/users', {
        name,
        email,
        username,
        password,
        mobile_number: mobileNumber,
        role,
        barangay_name: barangayName,
        position,
        committee_assigned: committeeAssigned,
        educational_attainment: educationalAttainment,
        education_degree: educationDegree,
        education_school: educationSchool,
        skills,
        bio_advocacy: bioAdvocacy,
        term_start: '2023-11-01',
        term_end: '2026-11-01',
        is_active: true,
      });

      if (res.data?.success) {
        onUserCreated();
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-[#efedf0] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1b1c1e] text-white p-5 flex items-center justify-between border-b-4 border-[#ba0c00]">
          <div>
            <span className="text-[10px] font-bold text-[#eebd90] uppercase tracking-wider block">
              Super Admin Control
            </span>
            <h3 className="font-['Poppins'] text-lg font-bold text-white">
              Create New Official User Account
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {error && (
          <div className="m-5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600 text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                Full Official Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hon. Juan Dela Cruz"
                className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="official@skportal.gov.ph"
                className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jdelacruz"
                className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                Initial Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="0917XXXXXXX"
                className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
              />
            </div>
          </div>

          {/* Role and Barangay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#efedf0]">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                Assigned Role *
              </label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs font-semibold outline-none focus:border-[#ba0c00]"
              >
                <option value="sk_chairperson">SK Chairperson</option>
                <option value="sk_secretary">SK Secretary</option>
                <option value="sk_treasurer">SK Treasurer</option>
                <option value="sk_kagawad">SK Kagawad (Councilor)</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                Barangay Jurisdiction *
              </label>
              <select
                value={barangayName}
                onChange={(e) => setBarangayName(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs font-semibold outline-none focus:border-[#ba0c00]"
              >
                {TAGUIG_BARANGAYS.map((b) => (
                  <option key={b} value={b}>
                    Barangay {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
              Committee Assigned
            </label>
            <input
              type="text"
              value={committeeAssigned}
              onChange={(e) => setCommitteeAssigned(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
            />
          </div>

          {/* Skills quick chips */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
              Verified Skills Profile
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SKILLS.slice(0, 10).map((sk) => {
                const has = skills.includes(sk);
                return (
                  <button
                    type="button"
                    key={sk}
                    onClick={() => toggleSkill(sk)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      has
                        ? 'bg-[#ba0c00] text-white'
                        : 'bg-gray-100 text-[#43474d] hover:bg-gray-200'
                    }`}
                  >
                    {sk} {has && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-[#efedf0] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c4c6ce] text-[#0e0f0f] text-xs font-bold rounded-lg cursor-pointer hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#ba0c00] hover:bg-[#920a00] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {loading ? 'Creating...' : 'Provision User Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
