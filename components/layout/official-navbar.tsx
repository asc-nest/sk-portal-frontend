'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NavAuthButton from '@/components/layout/nav-auth-button';
import useAuth from '@/hooks/use-auth';
import useSystemSettings from '@/hooks/use-system-settings';

interface OfficialNavbarProps {
  className?: string;
}

export default function OfficialNavbar({ className = '' }: OfficialNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { settings } = useSystemSettings();

  const isAdmin = user?.roles?.includes('super_admin') || user?.username === 'superadmin';

  // Navigation Links:
  // When logged in, officials only access their dashboard, so center navigation pills are omitted.
  let navItems: { label: string; href: string; exact: boolean }[] = [];

  if (!isAuthenticated || !user) {
    navItems = [{ label: 'Mag-Login', href: '/login', exact: true }];
    if (settings.allow_public_onboarding) {
      navItems.push({ label: 'Register / Onboard', href: '/onboarding', exact: false });
    }
  }

  const isItemActive = (item: { href: string; exact: boolean }) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-[#efedf0] transition-all ${className}`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href={isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/login"} className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ba0c00] flex items-center justify-center text-white font-bold text-sm shadow-sm font-['Poppins'] group-hover:scale-105 transition-transform">
              SK
            </div>
            <div className="flex flex-col text-left">
                <span suppressHydrationWarning className="font-['Poppins'] text-base sm:text-lg font-bold text-[#0e0f0f] leading-none tracking-tight group-hover:text-[#ba0c00] transition-colors line-clamp-1">
                  {settings.portal_name || 'City of Taguig'}
                </span>
                <span suppressHydrationWarning className="text-[10px] sm:text-[11px] font-semibold text-[#74777e] tracking-wider uppercase mt-0.5 line-clamp-1">
                  {settings.jurisdiction_name || 'Sangguniang Kabataan Federation'}
                </span>
                </div>
              </Link>
            </div>

            {/* Center: Navigation Links (Desktop, when present) */}
            {navItems.length > 0 && (
              <nav className="hidden md:flex items-center gap-1.5">
                {navItems.map((item) => {
                  const active = isItemActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${active
                          ? 'bg-[#242424] text-white shadow-xs'
                          : 'text-[#43474d] hover:text-[#0e0f0f] hover:bg-[#efedf0]'
                        }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right: Auth Profile Pill + Mobile Toggle */}
            <div className="flex items-center gap-2">
              <NavAuthButton />

              {/* Mobile Menu Button (when public nav items present) */}
              {navItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-[#43474d] hover:text-[#0e0f0f] hover:bg-[#efedf0] transition-colors cursor-pointer"
                  aria-label="Toggle navigation menu"
                >
                  <span className="material-symbols-outlined text-2xl">
                    {mobileMenuOpen ? 'close' : 'menu'}
                  </span>
                </button>
              )}
            </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && navItems.length > 0 && (
          <div className="md:hidden border-t border-[#efedf0] bg-white px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150 shadow-lg">
            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors ${active
                      ? 'bg-[#242424] text-white'
                      : 'text-[#43474d] hover:bg-[#efedf0] hover:text-[#0e0f0f]'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[#efedf0] flex items-center justify-between text-[11px] text-[#74777e] px-1">
              <span className="line-clamp-1">{settings.jurisdiction_name || 'Taguig SK Federation'}</span>
              <span className="font-semibold text-emerald-600 shrink-0">RA 10742 Verified</span>
            </div>
          </div>
        )}
    </header>
  );
}

