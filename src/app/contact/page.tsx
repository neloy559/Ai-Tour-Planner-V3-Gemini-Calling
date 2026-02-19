import { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact - AI Travel Planner',
  description: 'Contact us for support or inquiries',
};

export default function ContactPage() {
  return <ContactForm />;
}
