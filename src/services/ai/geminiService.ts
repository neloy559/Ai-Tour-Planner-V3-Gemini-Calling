import { parsePrompt } from '@/domain/promptParser';

interface GeminiResponse {
  title: string;
  summary: string;
  highlights: string[];
  itinerary: Array<{
    day: number;
    title: string;
    activities: string[];
  }>;
}

const planCache = new Map<string, GeminiResponse>();

const DAILY_LIMIT = 20;
let dailyRequestCount = 0;
let lastResetDate = new Date().toDateString();

function getCacheKey(prompt: string): string {
  return prompt.toLowerCase().trim();
}

function getFromCache(prompt: string): GeminiResponse | null {
  const key = getCacheKey(prompt);
  return planCache.get(key) || null;
}

function saveToCache(prompt: string, data: GeminiResponse): void {
  const key = getCacheKey(prompt);
  planCache.set(key, data);
}

function checkRateLimit(): void {
  const today = new Date().toDateString();
  if (lastResetDate !== today) {
    dailyRequestCount = 0;
    lastResetDate = today;
  }
  if (dailyRequestCount >= DAILY_LIMIT) {
    throw new Error('Daily API limit reached (20/day). Please try again tomorrow.');
  }
  dailyRequestCount++;
}

const GEMINI_MODEL = 'gemini-2.0-flash';

export async function generateTravelPlan(prompt: string): Promise<GeminiResponse> {
  const cached = getFromCache(prompt);
  if (cached) {
    console.log('Returning cached plan for:', prompt);
    return cached;
  }
  
  checkRateLimit();
  
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

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    const jsonText = data.candidates[0].content.parts[0].text;
    const aiResponse = JSON.parse(jsonText);
    
    const result = {
      title: aiResponse.title || 'Travel Plan',
      summary: aiResponse.summary || '',
      highlights: aiResponse.highlights || [],
      itinerary: aiResponse.itinerary || [],
    };
    
    saveToCache(prompt, result);
    
    return result;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response as JSON');
    }
    throw error;
  }
}

export default generateTravelPlan;
