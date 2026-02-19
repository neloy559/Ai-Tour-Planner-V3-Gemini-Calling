import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

// Inline the parsePrompt function to avoid import issues
interface ParsedPrompt {
  destination: string;
  days: number;
  budget: string;
  travelerType: string;
}

const TRAVELER_TYPES = [
  'solo', 'couple', 'family', 'friends', 'business',
  'adventure', 'relaxation', 'budget', 'luxury',
];

const BUDGET_TYPES = [
  'budget', 'moderate', 'mid-range', 'luxury', 'expensive', 'cheap', 'affordable',
];

function parsePrompt(prompt: string): ParsedPrompt {
  const lowerPrompt = prompt.toLowerCase();
  
  const daysMatch = prompt.match(/(\d+)\s*(?:days?|nights?|weeks?)/i);
  let days = 3;
  if (daysMatch) {
    const num = parseInt(daysMatch[1], 10);
    const unit = daysMatch[0].toLowerCase();
    if (unit.includes('week')) {
      days = num * 7;
    } else {
      days = num;
    }
  }
  if (days > 30) days = 30;

  let destination = '';
  
  const destinationPatterns = [
    /(\d+\s*(?:days?|nights?|weeks?)\s+in\s+)([a-zA-Z\s]+?)(?:\s+for|\s+on|\s*$)/i,
    /(?:plan\s+(?:a\s+)?(?:trip\s+to|visit)|(?:go\s+to|visit)\s+)?([a-zA-Z\s]+?)(?:\s+for|\s+in|\s+over|\s+within|\s+\d)/i,
  ];
  
  for (const pattern of destinationPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      destination = (match[2] || match[1]).trim();
      if (destination.length > 2) break;
    }
  }
  
  if (!destination) {
    const words = prompt.split(' ').filter(w => w.length > 2);
    destination = words.slice(0, 3).join(' ') || 'Unknown';
  }

  let budget = 'moderate';
  for (const b of BUDGET_TYPES) {
    if (lowerPrompt.includes(b)) {
      if (b === 'cheap' || b === 'budget' || b === 'affordable') {
        budget = 'budget';
      } else if (b === 'expensive' || b === 'luxury') {
        budget = 'luxury';
      } else {
        budget = b;
      }
      break;
    }
  }

  let travelerType = 'friends';
  for (const t of TRAVELER_TYPES) {
    if (lowerPrompt.includes(t)) {
      travelerType = t;
      break;
    }
  }
  if (lowerPrompt.includes('couple') || lowerPrompt.includes('honeymoon')) {
    travelerType = 'couple';
  } else if (lowerPrompt.includes('family') || lowerPrompt.includes('kids')) {
    travelerType = 'family';
  } else if (lowerPrompt.includes('business') || lowerPrompt.includes('work')) {
    travelerType = 'business';
  }

  return {
    destination: destination.replace(/\s+/g, ' ').trim(),
    days,
    budget,
    travelerType,
  };
}

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
const API_TOKEN_TTL_SECONDS = 3 * 60;

function generateJWTToken(): string {
  const apiKey = process.env.GLM_API_KEY;
  const apiSecret = process.env.GLM_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('GLM_API_KEY and GLM_API_SECRET must be configured in environment variables');
  }

  // Timestamps in MILLISECONDS (not seconds) as per Zhipu AI spec
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

async function generateTravelPlan(prompt: string): Promise<TravelPlanResponse> {
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

  const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
  const parsedContent = JSON.parse(cleanedContent);

  return {
    title: parsedContent.title || 'Travel Plan',
    summary: parsedContent.summary || '',
    highlights: parsedContent.highlights || [],
    itinerary: parsedContent.itinerary || [],
  };
}

// Test runner
async function runTest() {
  console.log('🧪 Testing GLM API Integration...');
  console.log('================================\n');

  try {
    // Check environment variables
    if (!process.env.GLM_API_KEY || !process.env.GLM_API_SECRET) {
      console.error('❌ Error: GLM_API_KEY and GLM_API_SECRET must be set in .env.local');
      process.exit(1);
    }

    console.log('✓ Environment variables loaded');
    console.log('✓ GLM_API_KEY:', process.env.GLM_API_KEY.substring(0, 10) + '...');
    console.log('✓ GLM_API_SECRET:', process.env.GLM_API_SECRET.substring(0, 10) + '...\n');

    console.log('📤 Sending test prompt: "3 days in Tokyo"\n');
    
    const result = await generateTravelPlan('3 days in Tokyo');
    
    console.log('\n📥 Response received:');
    console.log(JSON.stringify(result, null, 2));
    
    // Validate response
    const errors: string[] = [];
    const requiredFields = ['title', 'summary', 'highlights', 'itinerary'];
    
    for (const field of requiredFields) {
      if (!(field in result)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    if (result.itinerary && Array.isArray(result.itinerary)) {
      result.itinerary.forEach((day, index) => {
        if (typeof day.day !== 'number') errors.push(`itinerary[${index}].day should be a number`);
        if (typeof day.title !== 'string') errors.push(`itinerary[${index}].title should be a string`);
        if (!Array.isArray(day.activities)) errors.push(`itinerary[${index}].activities should be an array`);
      });
    }
    
    if (errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      errors.forEach(err => console.log(`   - ${err}`));
      process.exit(1);
    }
    
    console.log('\n✅ All validations passed!');
    console.log('\n🎉 GLM API test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

runTest();
