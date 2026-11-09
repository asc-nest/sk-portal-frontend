'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import AdminSidebar, { AdminSection } from '@/components/admin/admin-sidebar';
import AdminHeader from '@/components/admin/admin-header';
import UserDetailsModal from '@/components/admin/user-details-modal';
import CreateUserModal from '@/components/admin/create-user-modal';
import CivicLoader from '@/components/ui/civic-loader';
import { TAGUIG_BARANGAYS } from '@/lib/constants';

export default function SuperAdminPage() {
  const router = useRouter();

  // Core App State
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Modals
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Section 1: Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Section 2: User Management
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [barangayFilter, setBarangayFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const [userMeta, setUserMeta] = useState<any>({ total: 0, last_page: 1 });

  // Section 3: Roles & Permissions
  const [rolesData, setRolesData] = useState<any>(null);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Section 4: Activity Logs
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('all');
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logMeta, setLogMeta] = useState<any>({ total: 0, last_page: 1 });

  // Section 5: Analytics
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Section 6: Settings
  const [settingsData, setSettingsData] = useState<any[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Session and RBAC Check
  useEffect(() => {
    async function verifyAdminAuth() {
      try {
        setLoading(true);
        const token = localStorage.getItem('sk_token');
        const expiry = localStorage.getItem('sk_session_expires_at');

        if (!token || (expiry && Date.now() > Number(expiry))) {
          router.replace('/login');
          return;
        }

        const meRes = await apiClient.get('/auth/me');
        if (meRes.data?.data) {
          const user = meRes.data.data.user || meRes.data.data;
          const roles = user.roles || [];
          const isSuperAdmin = roles.includes('super_admin') || user.username === 'superadmin';

          if (!isSuperAdmin) {
            router.replace('/dashboard');
            return;
          }

          setAdminUser(user);
        }
      } catch (err) {
        console.error('Admin Auth Check Failed:', err);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    verifyAdminAuth();
  }, [router]);

  // 2. Fetch Dashboard Metrics
  const loadDashboardStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient.get('/admin/dashboard-stats');
      if (res.data?.success) {
        setDashboardStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 3. Fetch Users
  const loadUsers = useCallback(async (page = 1) => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', '12');
      if (userSearch.trim()) params.append('search', userSearch.trim());
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (barangayFilter !== 'all') params.append('barangay', barangayFilter);

      const res = await apiClient.get(`/admin/users?${params.toString()}`);
      if (res.data?.success) {
        setUsers(res.data.data);
        setUserMeta(res.data.meta);
        setUserPage(page);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch, roleFilter, statusFilter, barangayFilter]);

  // 4. Fetch Roles
  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const res = await apiClient.get('/admin/roles');
      if (res.data?.success) {
        setRolesData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load roles', err);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  // 5. Fetch Activity Logs
  const loadActivityLogs = useCallback(async (page = 1) => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', '15');
      if (logSearch.trim()) params.append('search', logSearch.trim());
      if (logActionFilter !== 'all') params.append('action', logActionFilter);

      const res = await apiClient.get(`/admin/activity-logs?${params.toString()}`);
      if (res.data?.success) {
        setActivityLogs(res.data.data);
        setLogMeta(res.data.meta);
        setAvailableActions(res.data.meta?.available_actions || []);
        setLogPage(page);
      }
    } catch (err) {
      console.error('Failed to load activity logs', err);
    } finally {
      setLogsLoading(false);
    }
  }, [logSearch, logActionFilter]);

  // 6. Fetch Analytics
  const loadAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const res = await apiClient.get('/admin/analytics');
      if (res.data?.success) {
        setAnalyticsData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // 7. Fetch Settings
  const loadSettings = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const res = await apiClient.get('/admin/settings');
      if (res.data?.success) {
        setSettingsData(res.data.data.settings || []);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Load section-specific data upon switching tabs
  useEffect(() => {
    if (!adminUser) return;
    if (currentSection === 'dashboard') loadDashboardStats();
    if (currentSection === 'users') loadUsers(1);
    if (currentSection === 'roles') loadRoles();
    if (currentSection === 'logs') loadActivityLogs(1);
    if (currentSection === 'analytics') loadAnalytics();
    if (currentSection === 'settings') loadSettings();
  }, [currentSection, adminUser, loadDashboardStats, loadUsers, loadRoles, loadActivityLogs, loadAnalytics, loadSettings]);

  // Logout handler
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

  // Quick Action: Toggle User Status
  const handleQuickToggleStatus = async (user: any) => {
    const nextStatus = !user.is_active;
    const action = nextStatus ? 'activate' : 'suspend';
    if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) return;

    try {
      const res = await apiClient.patch(`/admin/users/${user.id}/status`, {
        is_active: nextStatus,
        reason: nextStatus ? 'Reactivated by Super Admin' : 'Suspended via quick action table',
      });

      if (res.data?.success) {
        showToast(`Account for ${user.name} has been ${nextStatus ? 'activated' : 'suspended'}.`);
        loadUsers(userPage);
        loadDashboardStats();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update account status.', 'error');
    }
  };

  // Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSettingsSaving(true);
      setSettingsMessage(null);

      const payload = settingsData.map((s) => ({
        key: s.key,
        value: s.value,
      }));

      const res = await apiClient.put('/admin/settings', { settings: payload });
      if (res.data?.success) {
        setSettingsMessage('All system configurations saved and audited successfully.');
        showToast('System settings saved successfully.');

        try {
          const publicRes = await apiClient.get('/system/settings');
          if (publicRes.data?.success && publicRes.data?.data) {
            localStorage.setItem('sk_public_settings', JSON.stringify(publicRes.data.data));
            if (publicRes.data.data.portal_name && typeof document !== 'undefined') {
              document.title = publicRes.data.data.portal_name;
            }
          }
        } catch (e) {
          console.warn('Could not refresh public settings cache', e);
        }

        window.dispatchEvent(new Event('sk_settings_updated'));
      }
    } catch (err: any) {
      setSettingsMessage(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9fb]">
        <CivicLoader
          size="lg"
          label="Naglo-load ng Super Admin Console..."
          sublabel="City of Taguig • Sangguniang Kabataan Federation"
        />
      </div>
    );
  }

  const sectionTitles: Record<AdminSection, string> = {
    dashboard: 'Executive Dashboard & Overview',
    users: 'Central User & Profile Management',
    roles: 'Roles & Access Control (RBAC)',
    logs: 'Activity Audit Trail & Logs',
    analytics: 'Governance Reports & Analytics',
    settings: 'Portal System Configurations',
  };

  return (
    <div className="min-h-screen bg-[#faf9fb] text-[#1b1c1e] flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200 text-xs font-bold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-rose-950 text-rose-200 border-rose-800'
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {toastMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Fixed Sidebar */}
      <AdminSidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      {/* Main Administrative Workspace */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <AdminHeader
          sectionTitle={sectionTitles[currentSection]}
          onOpenSidebar={() => setSidebarOpen(true)}
          adminUser={adminUser}
          onLogout={handleLogout}
          searchTerm={currentSection === 'users' ? userSearch : undefined}
          onSearchChange={currentSection === 'users' ? (val) => { setUserSearch(val); loadUsers(1); } : undefined}
          searchPlaceholder="Search official name, username, email, barangay..."
        />

        {/* Dynamic Section Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* SECTION 1: DASHBOARD OVERVIEW */}
          {currentSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Banner Alert */}
              <div className="bg-gradient-to-r from-[#242424] to-[#121315] text-white p-6 sm:p-8 rounded-3xl shadow-md border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ba0c00] text-white text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    FEDERATION CENTRAL CONTROL
                  </div>
                  <h2 className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome to the Super Admin Dashboard
                  </h2>
                  <p className="text-xs sm:text-sm text-[#c8c6c5] max-w-2xl">
                    Centralized supervision, user provisioning, audit logging, and compliance across all 38 Barangays of Taguig City.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-3 bg-[#ba0c00] hover:bg-[#920a00] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Create Official
                  </button>
                  <button
                    onClick={() => setCurrentSection('users')}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                    Manage Users
                  </button>
                </div>
              </div>

              {/* 5 KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#efedf0] shadow-xs">
                  <div className="flex items-center justify-between text-[#74777e] mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
                    <span className="material-symbols-outlined text-lg text-[#ba0c00]">group</span>
                  </div>
                  <span className="font-['Poppins'] text-3xl font-extrabold text-[#0e0f0f] block">
                    {statsLoading ? '...' : dashboardStats?.total_users || 0}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                    System-wide user base
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#efedf0] shadow-xs">
                  <div className="flex items-center justify-between text-[#74777e] mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active Officials</span>
                    <span className="material-symbols-outlined text-lg text-emerald-600">how_to_reg</span>
                  </div>
                  <span className="font-['Poppins'] text-3xl font-extrabold text-emerald-600 block">
                    {statsLoading ? '...' : dashboardStats?.active_users || 0}
                  </span>
                  <span className="text-[10px] text-[#74777e] block mt-1">
                    Authorized council seats
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#efedf0] shadow-xs">
                  <div className="flex items-center justify-between text-[#74777e] mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">New (30 Days)</span>
                    <span className="material-symbols-outlined text-lg text-blue-600">person_add</span>
                  </div>
                  <span className="font-['Poppins'] text-3xl font-extrabold text-[#0e0f0f] block">
                    {statsLoading ? '...' : dashboardStats?.new_registrations_30d || 0}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold block mt-1">
                    Recent onboards
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#efedf0] shadow-xs">
                  <div className="flex items-center justify-between text-[#74777e] mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Suspended</span>
                    <span className="material-symbols-outlined text-lg text-amber-600">lock</span>
                  </div>
                  <span className="font-['Poppins'] text-3xl font-extrabold text-amber-600 block">
                    {statsLoading ? '...' : dashboardStats?.suspended_users || 0}
                  </span>
                  <span className="text-[10px] text-[#74777e] block mt-1">
                    Access revoked accounts
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#efedf0] shadow-xs">
                  <div className="flex items-center justify-between text-[#74777e] mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">38 Barangays</span>
                    <span className="material-symbols-outlined text-lg text-[#ba0c00]">location_city</span>
                  </div>
                  <span className="font-['Poppins'] text-3xl font-extrabold text-[#ba0c00] block">
                    {statsLoading ? '...' : `${dashboardStats?.barangays_covered || 38}/38`}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                    100% City Coverage
                  </span>
                </div>
              </div>

              {/* Dual Column: Registration Trend & Recent Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Registration Trends Chart */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#efedf0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#efedf0] pb-3">
                    <div>
                      <h3 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f]">
                        7-Day Registration Activity
                      </h3>
                      <p className="text-[11px] text-[#74777e]">
                        Daily volume of new official accounts on the platform
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      Live Pulse
                    </span>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                    {dashboardStats?.registration_trends?.map((day: any) => (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] font-bold text-[#74777e] group-hover:text-[#ba0c00]">
                          {day.count}
                        </span>
                        <div
                          style={{ height: `${Math.max(day.count * 15, 8)}%` }}
                          className="w-full max-w-[36px] bg-[#242424] group-hover:bg-[#ba0c00] rounded-t-lg transition-all"
                        ></div>
                        <span className="text-[10px] font-medium text-[#74777e] truncate">
                          {day.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Role Distribution Pills */}
                  <div className="pt-4 border-t border-[#efedf0] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[#74777e] text-[11px] uppercase">
                      Current Council Seats:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 text-[#ba0c00] font-bold text-[11px]">
                        38 Chairpersons
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold text-[11px]">
                        38 Secretaries
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold text-[11px]">
                        38 Treasurers
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                        114 Kagawads
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Recent Audit Activities */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#efedf0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#efedf0] pb-3">
                    <div>
                      <h3 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f]">
                        Recent Activity Trail
                      </h3>
                      <p className="text-[11px] text-[#74777e]">
                        Real-time audit log of administrative actions
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentSection('logs')}
                      className="text-xs font-bold text-[#ba0c00] hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {dashboardStats?.recent_activities?.map((log: any) => (
                      <div key={log.id} className="p-3 rounded-xl bg-[#faf9fb] border border-[#efedf0] flex items-start gap-3">
                        <span className="material-symbols-outlined text-[18px] text-[#ba0c00] shrink-0 mt-0.5">
                          bolt
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#0e0f0f] truncate">
                            {log.description}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-[#74777e] mt-0.5">
                            <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="font-mono">{log.action}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 38-Barangay Status Matrix Quick-Search */}
              <div className="bg-white p-6 rounded-2xl border border-[#efedf0] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#efedf0] pb-4">
                  <div>
                    <h3 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                      Taguig City 38-Barangay Operational Matrix
                    </h3>
                    <p className="text-xs text-[#74777e]">
                      Quick council status and roster inspection for all 38 barangays
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setBarangayFilter('all');
                      setCurrentSection('users');
                    }}
                    className="px-4 py-2 bg-[#242424] hover:bg-[#ba0c00] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    View All Officials Roster
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {TAGUIG_BARANGAYS.map((brgy) => (
                    <button
                      key={brgy}
                      onClick={() => {
                        setBarangayFilter(brgy);
                        setCurrentSection('users');
                      }}
                      className="p-3 text-left bg-[#faf9fb] hover:bg-red-50/50 hover:border-[#ba0c00] border border-[#efedf0] rounded-xl transition-all cursor-pointer group"
                    >
                      <span className="text-[10px] font-bold text-[#ba0c00] block mb-0.5">
                        Barangay
                      </span>
                      <strong className="text-xs font-bold text-[#0e0f0f] group-hover:text-[#ba0c00] block truncate">
                        {brgy}
                      </strong>
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                        Active Council (6)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: USER & PROFILE MANAGEMENT */}
          {currentSection === 'users' && (
            <div className="space-y-6">
              {/* Filter and Control Bar */}
              <div className="bg-white p-5 rounded-2xl border border-[#efedf0] shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f]">
                      Official User Accounts &amp; Profiles
                    </h3>
                    <p className="text-xs text-[#74777e]">
                      Search, view, provision, edit, suspend, or reactivate council user accounts.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 bg-[#ba0c00] hover:bg-[#920a00] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Create New Official
                  </button>
                </div>

                {/* Filter Pills / Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#efedf0]">
                  {/* Search */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                      Search Name / Email
                    </label>
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        loadUsers(1);
                      }}
                      placeholder="Type keyword..."
                      className="w-full h-10 px-3 bg-[#f5f3f6] rounded-xl text-xs outline-none focus:bg-white focus:border-[#ba0c00] border border-transparent"
                    />
                  </div>

                  {/* Role Filter */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                      Filter by Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        loadUsers(1);
                      }}
                      className="w-full h-10 px-3 bg-[#f5f3f6] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#ba0c00] border border-transparent"
                    >
                      <option value="all">All Roles</option>
                      <option value="sk_chairperson">SK Chairperson</option>
                      <option value="sk_secretary">SK Secretary</option>
                      <option value="sk_treasurer">SK Treasurer</option>
                      <option value="sk_kagawad">SK Kagawad</option>
                      <option value="super_admin">Super Administrator</option>
                    </select>
                  </div>

                  {/* Barangay Filter */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                      Barangay (38)
                    </label>
                    <select
                      value={barangayFilter}
                      onChange={(e) => {
                        setBarangayFilter(e.target.value);
                        loadUsers(1);
                      }}
                      className="w-full h-10 px-3 bg-[#f5f3f6] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#ba0c00] border border-transparent"
                    >
                      <option value="all">All 38 Barangays</option>
                      {TAGUIG_BARANGAYS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#74777e] block mb-1">
                      Account Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        loadUsers(1);
                      }}
                      className="w-full h-10 px-3 bg-[#f5f3f6] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#ba0c00] border border-transparent"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="suspended">Suspended Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-[#efedf0] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf9fb] border-b border-[#efedf0] text-[10px] uppercase font-bold text-[#74777e]">
                      <tr>
                        <th className="py-3.5 px-4">Official / User</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Barangay &amp; Position</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">SKMT Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#efedf0]">
                      {usersLoading ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-[#74777e]">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-[#ba0c00] border-t-transparent rounded-full animate-spin"></div>
                              <span>Loading user records...</span>
                            </div>
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-[#74777e]">
                            No user accounts matching the selected criteria.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => {
                          const primaryRole = u.roles?.[0]?.name || 'sk_kagawad';
                          const prof = u.official_profile;
                          const officialId = prof?.official_id_number || `ID-${u.id}`;

                          return (
                            <tr key={u.id} className="hover:bg-[#faf9fb] transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-[#242424] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                    {u.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                  </div>
                                  <div>
                                    <strong className="text-xs text-[#0e0f0f] block font-bold">
                                      {u.name}
                                    </strong>
                                    <span className="text-[11px] text-[#74777e]">
                                      {u.email} • <span className="font-mono">{officialId}</span>
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    primaryRole === 'super_admin'
                                      ? 'bg-red-50 text-[#ba0c00] border border-red-200'
                                      : primaryRole === 'sk_chairperson'
                                      ? 'bg-purple-50 text-purple-800'
                                      : primaryRole === 'sk_secretary'
                                      ? 'bg-blue-50 text-blue-800'
                                      : primaryRole === 'sk_treasurer'
                                      ? 'bg-amber-50 text-amber-800'
                                      : 'bg-emerald-50 text-emerald-800'
                                  }`}
                                >
                                  {primaryRole.replace('sk_', '')}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div>
                                  <span className="font-bold text-[#0e0f0f] block text-xs">
                                    Barangay {prof?.barangay_name || 'Taguig City'}
                                  </span>
                                  <span className="text-[11px] text-[#74777e] capitalize">
                                    {prof?.position || 'SK Official'} • {prof?.committee_assigned || 'General Affairs'}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    u.is_active
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      u.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                  ></span>
                                  <span>{u.is_active ? 'Active' : 'Suspended'}</span>
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                  <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                                  <span>Certified</span>
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedUserId(u.id)}
                                    className="px-3 py-1.5 bg-[#f5f3f6] hover:bg-[#ba0c00] hover:text-white text-[#0e0f0f] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                  >
                                    Inspect Dossier
                                  </button>

                                  <button
                                    onClick={() => handleQuickToggleStatus(u)}
                                    title={u.is_active ? 'Suspend Account' : 'Activate Account'}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                      u.is_active
                                        ? 'text-rose-600 hover:bg-rose-50'
                                        : 'text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-[18px]">
                                      {u.is_active ? 'block' : 'check_circle'}
                                    </span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 bg-[#faf9fb] border-t border-[#efedf0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#74777e]">
                  <span>
                    Showing {users.length} of {userMeta?.total || 0} registered accounts
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadUsers(userPage - 1)}
                      disabled={userPage <= 1}
                      className="px-3 py-1.5 rounded-lg border border-[#c4c6ce] hover:bg-white disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span>
                      Page {userPage} of {userMeta?.last_page || 1}
                    </span>
                    <button
                      onClick={() => loadUsers(userPage + 1)}
                      disabled={userPage >= (userMeta?.last_page || 1)}
                      className="px-3 py-1.5 rounded-lg border border-[#c4c6ce] hover:bg-white disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ROLES & RBAC PERMISSIONS */}
          {currentSection === 'roles' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#efedf0] shadow-xs space-y-2">
                <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f]">
                  Role-Based Access Control (RBAC) Architecture
                </h3>
                <p className="text-xs text-[#74777e]">
                  Spatie permission assignments across Sangguniang Kabataan executive roles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rolesLoading ? (
                  <div className="col-span-3 text-center py-12 text-xs text-[#74777e]">
                    Loading RBAC roles...
                  </div>
                ) : (
                  rolesData?.roles?.map((role: any) => (
                    <div key={role.id} className="bg-white p-6 rounded-2xl border border-[#efedf0] shadow-xs flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-[#ba0c00] bg-red-50 px-2 py-0.5 rounded">
                            {role.name}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            {role.user_count} Assigned Users
                          </span>
                        </div>
                        <h4 className="font-['Poppins'] text-base font-bold text-[#0e0f0f]">
                          {role.display_name}
                        </h4>
                        <p className="text-xs text-[#74777e] leading-relaxed">
                          {role.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#efedf0] space-y-2">
                        <span className="text-[10px] uppercase font-bold text-[#74777e] block">
                          Assigned Capabilities:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {role.permissions?.map((p: string) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded bg-[#f5f3f6] text-[10px] font-mono text-[#0e0f0f]"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: ACTIVITY AUDIT LOGS */}
          {currentSection === 'logs' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-[#efedf0] shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f]">
                      Administrative Activity Audit Trail
                    </h3>
                    <p className="text-xs text-[#74777e]">
                      Immutable chronological ledger of account provisioning, status alterations, and security actions.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Audit System Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#efedf0]">
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => {
                      setLogSearch(e.target.value);
                      loadActivityLogs(1);
                    }}
                    placeholder="Search action, administrator, target..."
                    className="h-10 px-3 bg-[#f5f3f6] rounded-xl text-xs outline-none focus:bg-white focus:border-[#ba0c00] border border-transparent"
                  />
                  <select
                    value={logActionFilter}
                    onChange={(e) => {
                      setLogActionFilter(e.target.value);
                      loadActivityLogs(1);
                    }}
                    className="h-10 px-3 bg-[#f5f3f6] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#ba0c00] border border-transparent"
                  >
                    <option value="all">All Action Types</option>
                    {availableActions.map((act) => (
                      <option key={act} value={act}>
                        {act}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-white rounded-2xl border border-[#efedf0] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf9fb] border-b border-[#efedf0] text-[10px] uppercase font-bold text-[#74777e]">
                      <tr>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Administrator</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#efedf0]">
                      {logsLoading ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-[#74777e]">
                            Loading audit logs...
                          </td>
                        </tr>
                      ) : activityLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-[#74777e]">
                            No activity records found.
                          </td>
                        </tr>
                      ) : (
                        activityLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-[#faf9fb] transition-colors">
                            <td className="py-3 px-4 text-[#74777e] font-mono text-[11px] whitespace-nowrap">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-bold text-[#0e0f0f]">
                              {log.user?.name || 'System'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-[#f5f3f6] text-[10px] font-mono font-bold text-[#ba0c00]">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[#43474d] text-xs">
                              {log.description}
                            </td>
                            <td className="py-3 px-4 text-[#74777e] font-mono text-[11px]">
                              {log.ip_address || '127.0.0.1'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-[#faf9fb] border-t border-[#efedf0] flex items-center justify-between text-xs font-semibold text-[#74777e]">
                  <span>Total Records: {logMeta?.total || 0}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadActivityLogs(logPage - 1)}
                      disabled={logPage <= 1}
                      className="px-3 py-1 rounded border border-[#c4c6ce] hover:bg-white disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span>Page {logPage}</span>
                    <button
                      onClick={() => loadActivityLogs(logPage + 1)}
                      disabled={logPage >= (logMeta?.last_page || 1)}
                      className="px-3 py-1 rounded border border-[#c4c6ce] hover:bg-white disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: REPORTS & ANALYTICS */}
          {currentSection === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#efedf0] shadow-xs space-y-1">
                <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f]">
                  City-Wide Governance Analytics &amp; Demographics
                </h3>
                <p className="text-xs text-[#74777e]">
                  Comprehensive insights across educational attainment, verified skills, and council representation.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Hard Skills Ranking */}
                <div className="bg-white p-6 rounded-2xl border border-[#efedf0] shadow-xs space-y-4">
                  <h4 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f] border-b border-[#efedf0] pb-3">
                    Top Verified Skills Across 38 Councils
                  </h4>
                  <div className="space-y-2.5">
                    {analyticsData?.skills_distribution &&
                      Object.entries(analyticsData.skills_distribution).slice(0, 10).map(([skill, count]: any) => (
                        <div key={skill} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-[#0e0f0f]">{skill}</span>
                            <span className="font-bold text-[#ba0c00]">{count} Officials</span>
                          </div>
                          <div className="w-full h-2 bg-[#f5f3f6] rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min((count / 60) * 100, 100)}%` }}
                              className="h-full bg-[#ba0c00] rounded-full"
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Educational Attainment Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-[#efedf0] shadow-xs space-y-4">
                  <h4 className="font-['Poppins'] text-sm font-bold text-[#0e0f0f] border-b border-[#efedf0] pb-3">
                    Educational Attainment Distribution
                  </h4>
                  <div className="space-y-3">
                    {analyticsData?.education_distribution &&
                      Object.entries(analyticsData.education_distribution).map(([level, count]: any) => (
                        <div key={level} className="p-3.5 rounded-xl bg-[#faf9fb] border border-[#efedf0] flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-lg text-[#ba0c00]">school</span>
                            <strong className="text-xs text-[#0e0f0f]">{level}</strong>
                          </div>
                          <span className="px-3 py-1 bg-white border border-[#efedf0] rounded-full font-bold text-xs text-[#ba0c00]">
                            {count} Officials
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: SYSTEM SETTINGS */}
          {currentSection === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#efedf0] shadow-xs space-y-1">
                <h3 className="font-['Poppins'] text-lg font-bold text-[#0e0f0f]">
                  Portal Administrative Configurations
                </h3>
                <p className="text-xs text-[#74777e]">
                  Manage system parameters, constitutional term settings, and access policies.
                </p>
              </div>

              {settingsMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                  <span>{settingsMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#efedf0] shadow-xs space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {settingsData.map((setting, idx) => (
                    <div key={setting.key} className="p-4 rounded-xl bg-[#faf9fb] border border-[#efedf0] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#0e0f0f] uppercase tracking-wide">
                          {setting.label}
                        </label>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#74777e]">
                          {setting.group}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#74777e] leading-tight">
                        {setting.description}
                      </p>

                      {setting.type === 'boolean' ? (
                        <div className="pt-2">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={setting.value === '1' || setting.value === true}
                              onChange={(e) => {
                                const nextVal = e.target.checked ? '1' : '0';
                                const updated = [...settingsData];
                                updated[idx].value = nextVal;
                                setSettingsData(updated);
                              }}
                              className="w-4 h-4 accent-[#ba0c00] cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-[#0e0f0f]">
                              {setting.value === '1' || setting.value === true ? 'Enabled' : 'Disabled'}
                            </span>
                          </label>
                        </div>
                      ) : (
                        <input
                          type={setting.type === 'integer' ? 'number' : 'text'}
                          value={setting.value || ''}
                          onChange={(e) => {
                            const updated = [...settingsData];
                            updated[idx].value = e.target.value;
                            setSettingsData(updated);
                          }}
                          className="w-full h-10 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs outline-none focus:border-[#ba0c00]"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#efedf0] flex justify-end">
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="px-8 py-3 bg-[#ba0c00] hover:bg-[#920a00] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {settingsSaving ? 'Saving Configurations...' : 'Save All System Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* User Details Modal (Requirement 3) */}
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUserUpdated={() => {
            loadUsers(userPage);
            loadDashboardStats();
          }}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onUserCreated={() => {
            showToast('New official user account created successfully.');
            loadUsers(1);
            loadDashboardStats();
          }}
        />
      )}
    </div>
  );
}

