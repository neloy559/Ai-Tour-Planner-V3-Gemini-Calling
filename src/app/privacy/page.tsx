import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - AI Travel Planner',
  description: 'Our privacy policy and how we protect your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            How we protect and handle your data
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h2>Data Collection</h2>
          <p>
            We collect minimal data necessary to provide our services. This includes your email address 
            when you sign up, travel preferences, and itinerary data you create.
          </p>

          <h2>How We Use Your Data</h2>
          <p>
            Your data is used solely to provide and improve our travel planning services. 
            We do not sell your personal information to third parties.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including 
            encryption in transit and at rest.
          </p>

          <h2>Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal data at any time. 
            Contact us to exercise these rights.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about our privacy policy, please contact us at 
            privacy@aitravelplanner.com.
          </p>
          </section>

      </div>
    </div>
  );
}
