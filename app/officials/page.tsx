'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CivicLoader from '@/components/ui/civic-loader';

export default function OfficialsDirectoryPage() {
  const router = useRouter();

  useEffect(() => {
    // Strict Access Control:
    // Non-admin users must ONLY access /dashboard.
    // Super admins must ONLY access /admin.
    // Unauthenticated users must go to /login.
    const token = typeof window !== 'undefined' ? localStorage.getItem('sk_token') : null;
    const expiry = typeof window !== 'undefined' ? localStorage.getItem('sk_session_expires_at') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('sk_user') : null;

    if (!token || (expiry && Date.now() > Number(expiry))) {
      router.replace('/login');
      return;
    }

    let isSuperAdmin = false;
    try {
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        isSuperAdmin = parsed?.roles?.includes('super_admin') || parsed?.username === 'superadmin';
      }
    } catch {}

    if (isSuperAdmin) {
      router.replace('/admin');
    } else {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9fb]">
      <CivicLoader
        size="lg"
        label="Nireredirect sa opisyal na workspace..."
        sublabel="Sangguniang Kabataan Federation • Lungsod ng Taguig"
      />
    </div>
  );
}
