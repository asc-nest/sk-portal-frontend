'use client';

import React from 'react';
import useSystemSettings from '@/hooks/use-system-settings';

export type AdminSection = 'dashboard' | 'users' | 'roles' | 'logs' | 'analytics' | 'settings';

interface AdminSidebarProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  isOpen: boolean;
  onClose: () => void;
  adminUser: any;
  onLogout: () => void;
}

export default function AdminSidebar({
  currentSection,
  onSelectSection,
  isOpen,
  onClose,
  adminUser,
  onLogout,
}: AdminSidebarProps) {
  const { settings } = useSystemSettings();
  const navItems: { id: AdminSection; label: string; icon: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'users', label: 'User & Profile Management', icon: 'manage_accounts' },
    { id: 'roles', label: 'Roles & Permissions (RBAC)', icon: 'shield_person' },
    { id: 'logs', label: 'Activity Audit Logs', icon: 'history' },
    { id: 'analytics', label: 'Reports & Analytics', icon: 'monitoring' },
    { id: 'settings', label: 'System Settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#1b1c1e] text-white flex flex-col justify-between border-r border-white/10 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ba0c00] flex items-center justify-center text-white font-extrabold text-sm shadow-md font-['Poppins']">
                SK
              </div>
              <div className="flex flex-col">
                  <span suppressHydrationWarning className="font-['Poppins'] text-sm font-bold tracking-tight text-white leading-tight line-clamp-1">
                    {settings.portal_name || 'Taguig SK Portal'}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#eebd90] tracking-wider">
                    Super Admin Console
                  </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden text-white/60 hover:text-white p-1"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <span className="px-3 text-[10px] uppercase tracking-wider font-bold text-[#74777e] block mb-2">
              Administration Core
            </span>

            {navItems.map((item) => {
              const active = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${active
                      ? 'bg-[#ba0c00] text-white shadow-sm font-bold'
                      : 'text-[#c8c6c5] hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[19px]">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: User Info & Actions */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#ba0c00] flex items-center justify-center text-white text-xs font-bold shrink-0">
                SA
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold text-white truncate">
                  {adminUser?.name || 'Super Administrator'}
                </span>
                <span className="block text-[10px] text-[#a0a2a8] truncate">
                  {adminUser?.email || 'admin@skportal.gov.ph'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="group flex items-center h-8 px-2 rounded-lg bg-white/5 hover:bg-[#ba0c00] text-[#a0a2a8] hover:text-white transition-all duration-300 ease-in-out cursor-pointer overflow-hidden border border-transparent hover:border-white/10"
            >
              <span className="material-symbols-outlined text-[17px] transition-transform duration-300 group-hover:-translate-x-0.5">
                logout
              </span>
              <span className="max-w-0 opacity-0 group-hover:max-w-[70px] group-hover:opacity-100 group-hover:ml-1.5 transition-all duration-300 ease-in-out whitespace-nowrap text-[11px] font-bold">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

