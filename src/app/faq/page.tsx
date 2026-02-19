import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - AI Travel Planner',
  description: 'Frequently Asked Questions about AI Travel Planner',
};

const faqs = [
  {
    question: 'How does AI Travel Planner work?',
    answer: 'Simply enter your destination, travel dates, and preferences. Our AI will generate a personalized itinerary tailored to your interests and budget.',
  },
  {
    question: 'Is it free to use?',
    answer: 'Yes, we offer a free tier that allows you to create up to 3 travel plans. For unlimited plans, check our pricing page.',
  },
  {
    question: 'Can I edit the generated itinerary?',
    answer: 'Absolutely! You can modify any part of your generated itinerary to better suit your preferences.',
  },
  {
    question: 'How accurate are the recommendations?',
    answer: 'Our AI uses up-to-date travel data and local knowledge to provide accurate recommendations. We continuously improve our models based on user feedback.',
  },
  {
    question: 'Can I save my plans?',
    answer: 'Yes, create an account to save all your travel plans and access them from any device.',
  },
  {
    question: 'What if I need help during my trip?',
    answer: 'Contact our support team anytime through the contact page. We\'re here to help 24/7.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about AI Travel Planner
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
