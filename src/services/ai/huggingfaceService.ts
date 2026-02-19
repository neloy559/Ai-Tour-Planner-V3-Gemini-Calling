import { HfInference } from '@huggingface/inference';
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

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!HF_API_KEY) {
  throw new Error('HUGGINGFACE_API_KEY must be configured in environment variables');
}

const hf = new HfInference(HF_API_KEY);

const MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

async function generateWithMistral(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await hf.chatCompletion({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 2000,
    temperature: 0.1,
  });

  return response.choices[0]?.message?.content || '';
}

function extractAndParseJson(content: string): any {
  // Try multiple strategies to extract valid JSON
  
  // Strategy 1: Direct parse after basic cleaning
  let cleaned = content
    .replace(/```json\s*|\s*```/g, '')
    .replace(/\*\*/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
  
  try {
    return JSON.parse(cleaned);
  } catch {}
  
  // Strategy 2: Extract JSON between first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    const extracted = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(extracted);
    } catch {}
  }
  
  // Strategy 3: Aggressive repair
  let repaired = cleaned;
  
  // Remove trailing commas
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');
  
  // Fix common JSON errors in activities
  // Replace problematic patterns
  repaired = repaired.replace(/\.\)"/g, '."');
  repaired = repaired.replace(/\)\s*"/g, '"');
  
  // Balance brackets
  const openSquare = (repaired.match(/\[/g) || []).length;
  const closeSquare = (repaired.match(/\]/g) || []).length;
  for (let i = 0; i < openSquare - closeSquare; i++) {
    repaired += ']';
  }
  
  const openBrace = (repaired.match(/{/g) || []).length;
  const closeBrace = (repaired.match(/}/g) || []).length;
  for (let i = 0; i < openBrace - closeBrace; i++) {
    repaired += '}';
  }
  
  try {
    return JSON.parse(repaired);
  } catch {}
  
  // Strategy 4: Manual parsing as fallback
  return manualParse(content);
}

function manualParse(content: string): any {
  // Very basic fallback parser for when JSON.parse fails
  const result: any = {
    title: 'Travel Plan',
    summary: '',
    highlights: [],
    itinerary: []
  };
  
  // Extract title
  const titleMatch = content.match(/"title"\s*:\s*"([^"]+)"/);
  if (titleMatch) result.title = titleMatch[1];
  
  // Extract summary
  const summaryMatch = content.match(/"summary"\s*:\s*"([^"]+)"/);
  if (summaryMatch) result.summary = summaryMatch[1];
  
  // Extract highlights
  const highlightsMatch = content.match(/"highlights"\s*:\s*\[([\s\S]*?)\]/);
  if (highlightsMatch) {
    const highlightsText = highlightsMatch[1];
    const highlightMatches = highlightsText.match(/"([^"]+)"/g);
    if (highlightMatches) {
      result.highlights = highlightMatches.map(h => h.replace(/"/g, ''));
    }
  }
  
  // Extract itinerary days
  const dayMatches = content.match(/"day"\s*:\s*(\d+)/g);
  const titleMatches = content.match(/"title"\s*:\s*"([^"]+)"/g);
  
  if (dayMatches) {
    for (let i = 0; i < dayMatches.length; i++) {
      const dayNum = parseInt(dayMatches[i].match(/\d+/)![0]);
      const dayTitle = titleMatches && titleMatches[i + 1] 
        ? titleMatches[i + 1].match(/"([^"]+)"$/)![1]
        : `Day ${dayNum}`;
      
      result.itinerary.push({
        day: dayNum,
        title: dayTitle,
        activities: ['Explore destination', 'Visit attractions', 'Enjoy local cuisine']
      });
    }
  }
  
  return result;
}

function validateAndFixResponse(parsed: any): TravelPlanResponse {
  const response: TravelPlanResponse = {
    title: typeof parsed?.title === 'string' ? parsed.title : 'Travel Plan',
    summary: typeof parsed?.summary === 'string' ? parsed.summary : '',
    highlights: Array.isArray(parsed?.highlights) 
      ? parsed.highlights.filter((h: any) => typeof h === 'string')
      : [],
    itinerary: Array.isArray(parsed?.itinerary)
      ? parsed.itinerary.map((day: any, index: number) => ({
          day: typeof day?.day === 'number' ? day.day : index + 1,
          title: typeof day?.title === 'string' ? day.title : `Day ${index + 1}`,
          activities: Array.isArray(day?.activities)
            ? day.activities.filter((a: any) => typeof a === 'string')
            : [],
        }))
      : [],
  };
  
  return response;
}

export async function generateTravelPlan(prompt: string): Promise<TravelPlanResponse> {
  const parsed = parsePrompt(prompt);

  const systemPrompt = `You are a travel planning assistant. Generate a travel itinerary.

Return ONLY a JSON object with this structure:
{
  "title": "Trip title",
  "summary": "Brief summary",
  "highlights": ["h1", "h2", "h3", "h4", "h5"],
  "itinerary": [
    {"day": 1, "title": "Day 1", "activities": ["a1", "a2", "a3"]},
    {"day": 2, "title": "Day 2", "activities": ["a1", "a2", "a3"]},
    {"day": 3, "title": "Day 3", "activities": ["a1", "a2", "a3"]}
  ]
}

Requirements:
- Exactly ${parsed.days} days
- Destination: ${parsed.destination}
- Budget: ${parsed.budget}
- Travelers: ${parsed.travelerType}
- 3 activities per day
- Plain text only`;

  try {
    console.log(`Generating travel plan with ${MODEL}...`);
    
    const content = await generateWithMistral(systemPrompt, `Create itinerary: ${prompt}`);

    if (!content) {
      throw new Error(`Empty response from model`);
    }

    console.log('Parsing response...');
    const parsedContent = extractAndParseJson(content);
    
    if (!parsedContent) {
      throw new Error('Failed to parse response as JSON');
    }

    const validatedResponse = validateAndFixResponse(parsedContent);
    
    // If we don't have itinerary data from parsing, create a basic structure
    if (validatedResponse.itinerary.length === 0) {
      console.log('Warning: Using fallback itinerary structure');
      for (let i = 1; i <= parsed.days; i++) {
        validatedResponse.itinerary.push({
          day: i,
          title: `Day ${i}`,
          activities: [
            `Explore ${parsed.destination}`,
            'Visit local attractions',
            'Enjoy local cuisine'
          ]
        });
      }
    }
    
    console.log(`✅ Successfully generated travel plan`);
    console.log(`   Title: ${validatedResponse.title}`);
    console.log(`   Days: ${validatedResponse.itinerary.length}`);

    return validatedResponse;
  } catch (error) {
    console.error(`❌ Failed to generate plan:`, (error as Error).message);
    throw error;
  }
}

export default generateTravelPlan;
