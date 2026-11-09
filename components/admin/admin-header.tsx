'use client';

import React from 'react';
import Link from 'next/link';

interface AdminHeaderProps {
  sectionTitle: string;
  onOpenSidebar: () => void;
  adminUser: any;
  onLogout: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

export default function AdminHeader({
  sectionTitle,
  onOpenSidebar,
  adminUser,
  onLogout,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search users, barangays, roles...',
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#efedf0] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-[#43474d] hover:text-[#0e0f0f] hover:bg-[#efedf0] rounded-lg cursor-pointer"
          aria-label="Open sidebar"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#74777e]">
          <span className="hidden sm:inline">Super Admin Console</span>
          <span className="hidden sm:inline">/</span>
          <h1 className="font-['Poppins'] text-sm sm:text-base font-bold text-[#0e0f0f]">
            {sectionTitle}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Input (if enabled for section) */}
      {onSearchChange !== undefined && (
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-[#74777e]">
              search
            </span>
            <input
              type="text"
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-10 pl-9 pr-4 bg-[#f5f3f6] focus:bg-white text-xs text-[#0e0f0f] rounded-xl border border-transparent focus:border-[#ba0c00] outline-none transition-all"
            />
          </div>
        </div>
      )}
    </header>
  );
}

