'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Plan {
  slug: string;
  destination: string;
  days: number;
  title?: string;
  status: string;
  createdAt: string;
}

export default function MyPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Travel Plans</h1>
          <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + New Plan
          </a>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">You haven&apos;t created any travel plans yet.</p>
            <a href="/" className="text-blue-600 hover:underline">Create your first plan →</a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <a key={plan.slug} href={`/plan/${plan.slug}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-br from-blue-50 to-emerald-50"></div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{plan.destination}</h3>
                  <p className="text-gray-500 text-sm">{plan.days} days</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
