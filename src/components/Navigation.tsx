'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-700">
                家計簿
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-primary-500 text-primary-700'
                    : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                }`}
              >
                ダッシュボード
              </Link>
              <Link
                href="/transactions"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/transactions')
                    ? 'border-primary-500 text-primary-700'
                    : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                }`}
              >
                取引
              </Link>
              <Link
                href="/accounts"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/accounts')
                    ? 'border-primary-500 text-primary-700'
                    : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                }`}
              >
                口座
              </Link>
              <Link
                href="/budgets"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/budgets')
                    ? 'border-primary-500 text-primary-700'
                    : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                }`}
              >
                予算
              </Link>
              <Link
                href="/reports"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/reports')
                    ? 'border-primary-500 text-primary-700'
                    : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                }`}
              >
                レポート
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={() => signOut()}
                className="btn-primary"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 