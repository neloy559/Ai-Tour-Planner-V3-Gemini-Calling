import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing - AI Travel Planner',
  description: 'Choose the plan that works for you',
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out our service',
    features: ['3 travel plans', 'Basic itineraries', 'Email support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    description: 'For frequent travelers',
    features: ['Unlimited plans', 'Detailed itineraries', 'Priority support', 'Save favorites', 'Export to PDF'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Family',
    price: '$19.99',
    period: 'per month',
    description: 'Share with your family',
    features: ['Everything in Pro', 'Up to 5 family members', 'Family sharing', 'Custom recommendations', 'Dedicated support'],
    cta: 'Start Free Trial',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your travel needs
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative bg-white rounded-2xl shadow-sm p-8 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block w-full py-3 text-center font-semibold rounded-lg transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
