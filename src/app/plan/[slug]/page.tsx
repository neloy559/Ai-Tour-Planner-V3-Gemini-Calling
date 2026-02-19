import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findPlanBySlug } from '@/repositories/planRepository';
import PlanDetailClient from './PlanDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plan = await findPlanBySlug(slug);

  if (!plan || plan.status !== 'completed') {
    return {
      title: 'Plan Your Trip - AI Travel Planner',
    };
  }

  return {
    title: `${plan.title} - AI Travel Planner`,
    description: plan.summary || `A ${plan.days}-day ${plan.destination} travel plan`,
    openGraph: {
      title: plan.title || 'Travel Plan',
      description: plan.summary || `A ${plan.days}-day trip to ${plan.destination}`,
      images: plan.heroImage?.url ? [plan.heroImage.url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: plan.title || 'Travel Plan',
      description: plan.summary || `A ${plan.days}-day trip to ${plan.destination}`,
      images: plan.heroImage?.url ? [plan.heroImage.url] : [],
    },
  };
}

export default async function PlanPage({ params }: Props) {
  const { slug } = await params;
  const plan = await findPlanBySlug(slug);

  if (!plan) {
    notFound();
  }

  return <PlanDetailClient plan={plan} />;
}
