'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session?.user?.name || 'Traveler'}!
          </h1>
          <p className="text-gray-600">Here&apos;s an overview of your travel planning activity</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-4xl font-bold text-blue-600">0</h3>
            <p className="text-gray-600">Total Plans</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-4xl font-bold text-emerald-600">0</h3>
            <p className="text-gray-600">Countries Explored</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-4xl font-bold text-purple-600">0</h3>
            <p className="text-gray-600">Days Planned</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Plans</h2>
            <a href="/my-plans" className="text-blue-600 hover:underline">View All →</a>
          </div>
          <p className="text-gray-500 text-center py-8">No plans yet. Start planning your first trip!</p>
          <div className="text-center">
            <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Your First Plan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
