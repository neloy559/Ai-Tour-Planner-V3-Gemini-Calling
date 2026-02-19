import OpenAI from 'openai';
import { parsePrompt } from '@/domain/promptParser';

interface TravelPlanResponse {
  title: string;
  summary: string;
  highlights: string[];
  itinerary: Array<{
    day: number;
    title: string;
    activities: string[];
  }>;
}

const OPENAI_MODEL = 'gpt-3.5-turbo';

export async function generateTravelPlan(prompt: string): Promise<TravelPlanResponse> {
  const parsed = parsePrompt(prompt);
  
  const systemPrompt = `You are an expert travel planner. Generate a detailed travel itinerary based on the user's request.

Generate a JSON response with exactly this structure:
{
  "title": "A catchy title for the trip",
  "summary": "A brief 2-3 sentence summary of the trip",
  "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4", "highlight 5"],
  "itinerary": [
    {
      "day": 1,
      "title": "Day 1 title",
      "activities": ["activity 1", "activity 2", "activity 3", "activity 4"]
    }
  ]
}

IMPORTANT:
- The itinerary should have exactly ${parsed.days} days
- Each day should have 3-4 activities
- Use the destination: ${parsed.destination}
- Budget style: ${parsed.budget}
- Traveler type: ${parsed.travelerType}
- Response must be valid JSON only, no markdown formatting`;

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Invalid response from OpenAI API');
    }

    const parsed = JSON.parse(content);
    
    return {
      title: parsed.title || 'Travel Plan',
      summary: parsed.summary || '',
      highlights: parsed.highlights || [],
      itinerary: parsed.itinerary || [],
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response as JSON');
    }
    throw error;
  }
}

export default generateTravelPlan;
