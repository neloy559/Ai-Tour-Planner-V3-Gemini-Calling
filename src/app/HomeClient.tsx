'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

interface Plan {
  _id: string;
  slug: string;
  destination: string;
  days: number;
  budget: string;
  travelerType: string;
  status: string;
  title?: string;
  summary?: string;
  highlights?: string[];
  heroImage?: {
    url: string;
    photographer: string;
    source: string;
  };
}

interface Props {
  latestPlans?: Plan[];
}

export default function HomeClient({ latestPlans = [] }: Props) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !days.trim()) return;

    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    setLoading(true);
    setError('');

    const prompt = `${days} days in ${destination}`;

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create plan');
      }

      router.push(`/plan/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">AI Travel Planner</h1>
          <nav className="flex gap-4 items-center">
            {session ? (
              <>
                <span className="text-gray-600">{session.user?.name || session.user?.email}</span>
                <button 
                  onClick={() => signOut()} 
                  className="text-gray-600 hover:text-blue-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={() => signIn()} 
                className="text-gray-600 hover:text-blue-900"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Trip with AI
          </h2>
          <p className="text-xl text-gray-600">
            Enter your destination and travel dates to get a personalized itinerary
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <input
                type="text"
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., Paris, Tokyo, New York"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Days
              </label>
              <input
                type="number"
                id="days"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="e.g., 3, 5, 7"
                min="1"
                max="30"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !destination.trim() || !days.trim()}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating your plan...' : status === 'unauthenticated' ? 'Sign In to Generate Plan' : 'Generate Travel Plan'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">Try these destinations:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              '3 days in Tokyo',
              '5 days in Paris',
              '7 days in Bali',
            ].map((example) => (
              <button
                key={example}
                onClick={() => {
                  const [d, text] = example.split(' days in ');
                  setDays(d);
                  setDestination(text);
                }}
                className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </main>

      {latestPlans.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Recent Travel Plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestPlans.map((plan) => (
              <a
                key={plan.slug}
                href={session ? `/plan/${plan.slug}` : '#'}
                onClick={(e) => {
                  if (!session) {
                    e.preventDefault();
                    signIn();
                  }
                }}
                className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                {plan.heroImage?.url && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={plan.heroImage.url}
                      alt={plan.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {plan.title || plan.destination}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {plan.destination} • {plan.days} days
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <footer className="py-8 text-center text-gray-500">
        <p>Powered by AI • Built with Next.js</p>
      </footer>
    </div>
  );
}
