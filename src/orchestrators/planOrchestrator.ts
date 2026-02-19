import { generateTravelPlan } from '@/services/ai/huggingfaceService';
import { fetchHeroImage } from '@/services/media/imageService';
import { updatePlanStatus } from '@/repositories/planRepository';
import { z } from 'zod';

const TravelPlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    activities: z.array(z.string()),
  })),
});

export async function generatePlan(slug: string): Promise<void> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const planDoc = await import('@/repositories/planRepository').then(m => m.findPlanBySlug(slug));
      
      if (!planDoc) {
        throw new Error('Plan not found');
      }

      const prompt = `Plan a ${planDoc.destination} trip for ${planDoc.days} days, ${planDoc.budget} budget, ${planDoc.travelerType} travelers`;

      let aiResponse;
      try {
        aiResponse = await generateTravelPlan(prompt);
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }

      const validated = TravelPlanSchema.parse(aiResponse);

      let heroImage;
      try {
        heroImage = await fetchHeroImage(planDoc.destination);
      } catch {
        heroImage = {
          url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
          photographer: 'Unsplash',
          source: 'Unsplash',
        };
      }

      await updatePlanStatus(slug, 'completed', {
        title: validated.title,
        summary: validated.summary,
        highlights: validated.highlights,
        itinerary: validated.itinerary,
        heroImage,
        rawAiResponse: aiResponse as unknown as Record<string, unknown>,
        aiVersion: 'v1',
        promptVersion: 'v1',
        errorMessage: undefined,
      });

      return;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed for slug ${slug}:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  await updatePlanStatus(slug, 'failed', {
    errorMessage: lastError?.message || 'Failed to generate plan after retries',
  });
  
  throw lastError || new Error('Failed to generate plan');
}

export default generatePlan;
