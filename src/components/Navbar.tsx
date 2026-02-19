'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg"></div>
              <span className="font-bold text-xl">AI Travel Planner</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className={`text-sm font-medium ${isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Home
              </Link>
              <Link href="/about" className={`text-sm font-medium ${isActive('/about') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                About
              </Link>
              <Link href="/pricing" className={`text-sm font-medium ${isActive('/pricing') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Pricing
              </Link>
              <Link href="/faq" className={`text-sm font-medium ${isActive('/faq') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                FAQ
              </Link>
              <Link href="/contact" className={`text-sm font-medium ${isActive('/contact') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-20 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/my-plans" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  My Plans
                </Link>
                <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
