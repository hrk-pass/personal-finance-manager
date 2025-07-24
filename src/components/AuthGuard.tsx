'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/auth') {
        router.push('/auth');
      } else if (user && pathname === '/auth') {
        router.push('/');
      }
    }
  }, [user, loading, router, pathname]);

  // ローディング中は何も表示しない
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 認証ページの場合は、未認証状態でのみ表示
  if (pathname === '/auth' && !user) {
    return <>{children}</>;
  }

  // 認証済みの場合のみコンテンツを表示
  if (user) {
    return <>{children}</>;
  }

  // それ以外の場合は何も表示しない
  return null;
} 