import { NextRequest, NextResponse } from 'next/server';
import { parsePrompt } from '@/domain/promptParser';
import { generateSlug } from '@/domain/slugGenerator';
import { isTravelRelated } from '@/domain/travelValidator';
import { 
  createPlan, 
  findPlanByParams, 
  findPlanBySlug 
} from '@/repositories/planRepository';
import { generatePlan } from '@/orchestrators/planOrchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!isTravelRelated(prompt)) {
      return NextResponse.json(
        { error: 'Please provide a travel-related prompt' },
        { status: 400 }
      );
    }

    const parsed = parsePrompt(prompt);

    const existingPlan = await findPlanByParams({
      destination: parsed.destination,
      days: parsed.days,
      budget: parsed.budget,
      travelerType: parsed.travelerType,
    });

    if (existingPlan) {
      return NextResponse.json({
        slug: existingPlan.slug,
        status: existingPlan.status,
        message: existingPlan.status === 'completed' 
          ? 'Plan already exists' 
          : 'Plan is being generated',
      });
    }

    const slug = generateSlug(
      parsed.destination,
      parsed.days,
      parsed.budget,
      parsed.travelerType
    );

    const plan = await createPlan({
      slug,
      destination: parsed.destination,
      days: parsed.days,
      budget: parsed.budget,
      travelerType: parsed.travelerType,
    });

    generatePlan(slug).catch(err => {
      console.error('Background plan generation failed:', err);
    });

    return NextResponse.json({
      slug: plan.slug,
      status: plan.status,
      message: 'Plan is being generated',
    });
  } catch (error) {
    console.error('Error in create plan:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create plan', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'Slug is required' },
      { status: 400 }
    );
  }

  try {
    const plan = await findPlanBySlug(slug);

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      slug: plan.slug,
      status: plan.status,
      destination: plan.destination,
      days: plan.days,
      budget: plan.budget,
      travelerType: plan.travelerType,
      title: plan.title,
      summary: plan.summary,
      highlights: plan.highlights,
      itinerary: plan.itinerary,
      heroImage: plan.heroImage,
      errorMessage: plan.errorMessage,
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}
