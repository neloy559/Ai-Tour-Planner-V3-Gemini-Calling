import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About - AI Travel Planner',
  description: 'Learn about AI Travel Planner and how it works',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">About AI Travel Planner</h1>
          <p className="text-xl text-gray-600">
            Your personal AI-powered travel assistant that creates personalized itineraries in seconds.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: '1. Enter Your Trip', desc: 'Tell us your destination, dates, and preferences' },
              { title: '2. AI Generates Plan', desc: 'Our AI creates a personalized itinerary in seconds' },
              { title: '3. Explore & Enjoy', desc: 'Get detailed day-by-day plans with activities' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-xl mb-8 opacity-90">Create your first travel plan in seconds</p>
        <Link href="/" className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
          Get Started
        </Link>
      </section>
    </div>
  );
}
