import { Metadata } from 'next';
import HomeClient from './HomeClient';
import { getLatestCompletedPlans } from '@/repositories/planRepository';

export const metadata: Metadata = {
  title: 'AI Smart Travel Planner',
  description: 'Generate personalized travel itineraries with AI',
  openGraph: {
    title: 'AI Smart Travel Planner',
    description: 'Generate personalized travel itineraries with AI',
    type: 'website',
  },
};

export default async function Home() {
  let latestPlans: import('@/models/Plan').IPlan[] = [];
  try {
    latestPlans = await getLatestCompletedPlans(4);
  } catch (error) {
    console.error('Failed to fetch latest plans:', error);
  }

  const serializedPlans = latestPlans.map(plan => ({
    ...plan,
    _id: plan._id.toString(),
  }));
  
  return <HomeClient latestPlans={serializedPlans} />;
}
