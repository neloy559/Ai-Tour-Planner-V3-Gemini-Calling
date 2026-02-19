import Plan, { IPlan } from '@/models/Plan';
import connectDB from '@/lib/db';

export async function createPlan(data: {
  slug: string;
  destination: string;
  days: number;
  budget: string;
  travelerType: string;
  user?: string;
}): Promise<IPlan> {
  await connectDB();
  
  const plan = await Plan.create({
    ...data,
    status: 'pending',
  });
  
  return plan;
}

export async function findPlanBySlug(slug: string): Promise<IPlan | null> {
  await connectDB();
  return Plan.findOne({ slug }).lean();
}

export async function findPlanByParams(params: {
  destination: string;
  days: number;
  budget: string;
  travelerType: string;
}): Promise<IPlan | null> {
  await connectDB();
  return Plan.findOne(params).lean();
}

export async function updatePlanStatus(
  slug: string,
  status: 'pending' | 'completed' | 'failed',
  data?: Partial<IPlan>
): Promise<IPlan | null> {
  await connectDB();
  return Plan.findOneAndUpdate(
    { slug },
    { $set: { status, ...data } },
    { returnDocument: 'after' }
  );
}

export async function getLatestCompletedPlans(limit: number = 4): Promise<IPlan[]> {
  await connectDB();
  return Plan.find({ status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

const planRepository = {
  createPlan,
  findPlanBySlug,
  findPlanByParams,
  updatePlanStatus,
  getLatestCompletedPlans,
};

export default planRepository;
