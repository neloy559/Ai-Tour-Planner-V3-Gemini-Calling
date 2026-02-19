import { NextRequest, NextResponse } from 'next/server';
import { findPlanBySlug } from '@/repositories/planRepository';

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
      title: plan.title,
      errorMessage: plan.errorMessage,
    });
  } catch (error) {
    console.error('Error checking plan status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
