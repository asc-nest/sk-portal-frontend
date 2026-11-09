'use client';

import React from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/use-auth';

interface NavAuthButtonProps {
  className?: string;
}

export default function NavAuthButton({ className = '' }: NavAuthButtonProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className={`h-10 w-10 rounded-xl bg-[#efedf0] animate-pulse ${className}`} />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#242424] text-white hover:bg-[#ba0c00] transition-all text-xs font-bold shadow-sm ${className}`}
      >
        <span className="material-symbols-outlined text-[16px]">lock</span>
        Council Sign In
      </Link>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={() => logout()}
        className="group relative flex items-center h-10 px-3 rounded-xl bg-[#242424] hover:bg-[#ba0c00] text-white shadow-sm transition-all duration-300 ease-in-out cursor-pointer overflow-hidden border border-white/10 hover:shadow-md"
        title="Logout sa SK Portal"
      >
        <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:-translate-x-0.5">
          logout
        </span>
        <span className="max-w-0 opacity-0 group-hover:max-w-[70px] group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold font-['Poppins']">
          Logout
        </span>
      </button>
    </div>
  );
}
