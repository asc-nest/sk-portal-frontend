'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CivicLoader from '@/components/ui/civic-loader';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Portal is strictly private - not accessible to the public
    const token = typeof window !== 'undefined' ? localStorage.getItem('sk_token') : null;
    const expiry = typeof window !== 'undefined' ? localStorage.getItem('sk_session_expires_at') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('sk_user') : null;

    if (token && (!expiry || Date.now() < Number(expiry))) {
      let isSuperAdmin = false;
      try {
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          isSuperAdmin = parsed?.roles?.includes('super_admin') || parsed?.username === 'superadmin';
        }
      } catch {
        // ignore
      }

      if (isSuperAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9fb]">
      <CivicLoader
        size="lg"
        label="Kinokonekta sa SK Portal..."
        sublabel="Sangguniang Kabataan Federation • Lungsod ng Taguig"
      />
    </div>
  );
}
