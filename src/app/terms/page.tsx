import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - AI Travel Planner',
  description: 'Terms of service for using AI Travel Planner',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Please read our terms carefully
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using AI Travel Planner, you accept and agree to be bound 
            by the terms and provision of this agreement.
          </p>

          <h2>Use License</h2>
          <p>
            Permission is granted to temporarily use AI Travel Planner for personal, 
            non-commercial transitory viewing only.
          </p>

          <h2>User Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account 
            and password. You agree to accept responsibility for all activities that 
            occur under your account.
          </p>

          <h2>Prohibited Uses</h2>
          <p>
            You may not use our service for any unlawful purpose or to violate any 
            laws or regulations.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            AI Travel Planner shall not be liable for any indirect, incidental, or 
            consequential damages arising out of your use of the service.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Your continued 
            use of the service constitutes acceptance of any changes.
          </p>

          <h2>Contact</h2>
          <p>
            If you have any questions about these terms, please contact us at 
            legal@aitravelplanner.com.
          </p>
        </div>
      </section>
    </div>
  );
}
