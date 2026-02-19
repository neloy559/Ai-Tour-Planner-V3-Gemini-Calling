import jwt from 'jsonwebtoken';
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

interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GLMRequest {
  model: string;
  messages: GLMMessage[];
  temperature: number;
  max_tokens: number;
}

interface GLMResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const GLM_API_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const GLM_MODEL = 'glm-4-plus';
const API_TOKEN_TTL_SECONDS = 3 * 60; // 3 minutes

function generateJWTToken(): string {
  const apiKey = process.env.GLM_API_KEY;
  const apiSecret = process.env.GLM_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('GLM_API_KEY and GLM_API_SECRET must be configured in environment variables');
  }

  // Zhipu AI expects timestamps in MILLISECONDS (not seconds)
  const payload = {
    api_key: apiKey,
    exp: Math.round(Date.now() * 1000) + API_TOKEN_TTL_SECONDS * 1000,
    timestamp: Math.round(Date.now() * 1000),
  };

  return jwt.sign(payload, apiSecret, {
    algorithm: 'HS256',
    header: { alg: 'HS256', sign_type: 'SIGN' } as jwt.JwtHeader
  });
}

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
- Response must be valid JSON only, no markdown formatting
- Do not wrap the response in code blocks`;

  const token = generateJWTToken();

  const requestBody: GLMRequest = {
    model: GLM_MODEL,
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
  };

  try {
    const response = await fetch(GLM_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`GLM API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data: GLMResponse = await response.json();

    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Invalid response from GLM API: no content in response');
    }

    let parsedContent: TravelPlanResponse;
    
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    return {
      title: parsedContent.title || 'Travel Plan',
      summary: parsedContent.summary || '',
      highlights: parsedContent.highlights || [],
      itinerary: parsedContent.itinerary || [],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while calling GLM API');
  }
}

export default generateTravelPlan;
