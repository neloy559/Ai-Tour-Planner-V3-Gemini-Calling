import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '@/models/Plan';
import { generateTravelPlan } from '@/services/ai/geminiService';

dotenv.config({ path: '.env.local' });

const SEED_DESTINATIONS = [
  { destination: 'Bali', days: 3, budget: 'moderate', travelerType: 'family' },
  { destination: 'Paris', days: 3, budget: 'moderate', travelerType: 'couples' },
  { destination: 'Tokyo', days: 3, budget: 'moderate', travelerType: 'solo' },
  { destination: 'Rome', days: 3, budget: 'budget', travelerType: 'solo' },
  { destination: 'New York', days: 3, budget: 'luxury', travelerType: 'family' },
  { destination: 'London', days: 3, budget: 'moderate', travelerType: 'solo' },
  { destination: 'Barcelona', days: 3, budget: 'moderate', travelerType: 'couples' },
  { destination: 'Dubai', days: 3, budget: 'luxury', travelerType: 'family' },
  { destination: 'Singapore', days: 3, budget: 'moderate', travelerType: 'solo' },
  { destination: 'Bangkok', days: 3, budget: 'budget', travelerType: 'solo' },
  { destination: 'Tokyo', days: 5, budget: 'luxury', travelerType: 'couples' },
  { destination: 'Paris', days: 5, budget: 'luxury', travelerType: 'couples' },
  { destination: 'Bali', days: 5, budget: 'moderate', travelerType: 'family' },
  { destination: 'Rome', days: 5, budget: 'moderate', travelerType: 'family' },
  { destination: 'Sydney', days: 5, budget: 'luxury', travelerType: 'solo' },
  { destination: 'Amsterdam', days: 3, budget: 'moderate', travelerType: 'solo' },
  { destination: 'Istanbul', days: 3, budget: 'moderate', travelerType: 'couples' },
  { destination: 'Bangkok', days: 5, budget: 'budget', travelerType: 'solo' },
  { destination: 'Hong Kong', days: 3, budget: 'moderate', travelerType: 'family' },
  { destination: 'Santorini', days: 3, budget: 'luxury', travelerType: 'couples' },
];

function generateSlug(destination: string, days: number, budget: string, travelerType: string): string {
  return `${destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${days}-days-${budget}-${travelerType}`;
}

function generatePrompt(destination: string, days: number, budget: string, travelerType: string): string {
  return `Plan a ${days}-day trip to ${destination} for ${travelerType} travelers with a ${budget} budget.`;
}

async function seedDestinations() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not defined in .env.local');
    process.exit(1);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not defined in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Plan.deleteMany({});
    console.log('Cleared existing plans');

    console.log(`\nStarting to seed ${SEED_DESTINATIONS} destinations with 5-second delay between API calls...`);
    console.log(`API limit: 20 requests/day\n`);

    for (let i = 0; i < SEED_DESTINATIONS.length; i++) {
      const dest = SEED_DESTINATIONS[i];
      const slug = generateSlug(dest.destination, dest.days, dest.budget, dest.travelerType);
      const prompt = generatePrompt(dest.destination, dest.days, dest.budget, dest.travelerType);

      console.log(`[${i + 1}/${SEED_DESTINATIONS.length}] Generating plan for: ${dest.destination} (${dest.days} days, ${dest.budget}, ${dest.travelerType})`);

      try {
        const aiResult = await generateTravelPlan(prompt);

        await Plan.create({
          slug,
          destination: dest.destination,
          days: dest.days,
          budget: dest.budget,
          travelerType: dest.travelerType,
          status: 'completed',
          title: aiResult.title,
          summary: aiResult.summary,
          highlights: aiResult.highlights,
          itinerary: aiResult.itinerary,
        });

        console.log(`  ✓ Saved: ${aiResult.title}`);
      } catch (error) {
        console.error(`  ✗ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        await Plan.create({
          slug,
          destination: dest.destination,
          days: dest.days,
          budget: dest.budget,
          travelerType: dest.travelerType,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      if (i < SEED_DESTINATIONS.length - 1) {
        console.log('  Waiting 5 seconds before next API call...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const count = await Plan.countDocuments();
    console.log(`\n✓ Seeding complete! Total plans in database: ${count}`);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDestinations();
