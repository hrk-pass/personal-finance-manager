'use client';

import { WalletIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signInWithGoogle } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      console.error('Error signing in:', error);
      // TODO: エラー処理を追加
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 text-indigo-600">
            <WalletIcon />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            個人財務管理
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            アカウントにログインして、財務を管理しましょう
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Googleでログイン
          </button>
        </div>
      </div>
    </div>
  );
} 