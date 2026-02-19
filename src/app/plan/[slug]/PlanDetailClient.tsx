'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Plan {
  slug: string;
  status: 'pending' | 'completed' | 'failed';
  destination: string;
  days: number;
  budget: string;
  travelerType: string;
  title?: string;
  summary?: string;
  highlights?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    activities: string[];
  }>;
  heroImage?: {
    url: string;
    photographer: string;
    source: string;
  };
  errorMessage?: string;
}

interface Props {
  plan: Plan;
}

export default function PlanDetailClient({ plan: initialPlan }: Props) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (plan.status === 'pending') {
      const pollStatus = async () => {
        try {
          const res = await fetch(`/api/plan/status?slug=${plan.slug}`);
          const data = await res.json();
          
          if (data.status === 'completed' || data.status === 'failed') {
            setPlan(data);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      };

      const interval = setInterval(pollStatus, 3000);
      const timeout = setTimeout(() => clearInterval(interval), 45000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [plan.status, plan.slug]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${plan.days} days in ${plan.destination} for ${plan.travelerType} on ${plan.budget} budget`,
        }),
      });
      
      const data = await response.json();
      if (data.slug) {
        router.push(`/plan/${data.slug}`);
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setRetrying(false);
    }
  };

  if (plan.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Travel Plan</h2>
          <p className="text-gray-600">
            AI is crafting your personalized itinerary for {plan.destination}...
          </p>
        </div>
      </div>
    );
  }

  if (plan.status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Generation Failed</h2>
          <p className="text-gray-600 mb-6">
            {plan.errorMessage || 'Something went wrong while generating your plan.'}
          </p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="min-h-screen bg-white">
      {plan.heroImage?.url && (
        <div className="relative h-96 w-full">
          <img
            src={plan.heroImage.url}
            alt={plan.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-2">{plan.title}</h1>
              <p className="text-lg opacity-90">
                {plan.destination} • {plan.days} days • {plan.budget} budget
              </p>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <span className="text-xs text-white/70">
              Photo by {plan.heroImage.photographer} on {plan.heroImage.source}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </Link>
          <a
            href={facebookShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Share on Facebook
          </a>
        </div>

        {plan.summary && (
          <div className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">{plan.summary}</p>
          </div>
        )}

        {plan.highlights && plan.highlights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {plan.itinerary && plan.itinerary.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Day-by-Day Itinerary</h2>
            <div className="space-y-6">
              {plan.itinerary.map((day) => (
                <div key={day.day} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{day.title}</h3>
                      <ul className="space-y-2">
                        {day.activities.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
