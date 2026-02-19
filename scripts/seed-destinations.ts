import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '@/models/Plan';

dotenv.config({ path: '.env.local' });

const SAMPLE_PLANS = [
  {
    destination: 'Paris',
    days: 3,
    budget: 'moderate',
    travelerType: 'couple',
    title: 'Romantic Paris Getaway',
    summary: 'A wonderful 3-day romantic escape to the City of Light, exploring iconic landmarks and charming cafes.',
    highlights: [
      'Eiffel Tower sunset visit',
      'Louvre Museum art tour',
      'Seine River romantic dinner cruise',
      'Montmartre artist district walk',
      'Champs-Élysées shopping'
    ],
    itinerary: [
      { day: 1, title: 'Arrival & Iconic Sights', activities: ['Check into hotel', 'Visit Eiffel Tower', 'Dinner at Latin Quarter'] },
      { day: 2, title: 'Art & Culture', activities: ['Louvre Museum morning', 'Tuileries Garden walk', 'Notre-Dame area', 'Seine cruise'] },
      { day: 3, title: 'Final Explorations', activities: ['Montmartre visit', 'Shopping at Champs-Élysées', 'Departure'] }
    ]
  },
  {
    destination: 'Tokyo',
    days: 5,
    budget: 'luxury',
    travelerType: 'family',
    title: 'Family Adventure in Tokyo',
    summary: 'An exciting 5-day journey through modern and traditional Tokyo, perfect for the whole family.',
    highlights: [
      'Tokyo Disneyland fun',
      'TeamLab borderless experience',
      'Senso-ji Temple visit',
      'Shibuya Crossing excitement',
      'Tokyo Tower observation'
    ],
    itinerary: [
      { day: 1, title: 'Welcome to Tokyo', activities: ['Arrival & hotel check-in', 'Shibuya exploration', 'Dinner in Shinjuku'] },
      { day: 2, title: 'Theme Park Day', activities: ['Full day at Disneyland', 'Fireworks show'] },
      { day: 3, title: 'Cultural Discovery', activities: ['Senso-ji Temple', 'Tokyo National Museum', 'Ueno Park'] },
      { day: 4, title: 'Modern Tokyo', activities: ['TeamLab exhibit', 'Tokyo Tower', 'Harajuku shopping'] },
      { day: 5, title: 'Final Day', activities: ['Last-minute sightseeing', 'Airport departure'] }
    ]
  },
  {
    destination: 'Bali',
    days: 7,
    budget: 'budget',
    travelerType: 'solo',
    title: 'Solo Explorer in Bali',
    summary: 'A budget-friendly 7-day adventure through Bali temples, beaches, and cultural experiences.',
    highlights: [
      'Ubud rice terraces trek',
      'Sacred monkey forest',
      'Uluwatu sunset temple',
      'Seminyak beach vibes',
      'Local Warung food tour'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Bali', activities: ['Airport pickup', 'Check into hostel', 'Kuta beach sunset'] },
      { day: 2, title: 'Ubud Cultural Day', activities: ['Tegallalang rice terraces', 'Ubud Palace', 'Monkey Forest'] },
      { day: 3, title: 'Temple Exploration', activities: ['Tirta Empul temple', 'Gunung Kawi', 'Local market'] },
      { day: 4, title: 'Beach Day', activities: ['Seminyak beach', 'Beach clubs', 'Surf lesson'] },
      { day: 5, title: 'South Bali', activities: ['Uluwatu temple', 'Jimbaran bay dinner', 'Kecak dance'] },
      { day: 6, title: 'Nature & Wellness', activities: ['Yoga class', 'Waterfall hike', 'Spa treatment'] },
      { day: 7, title: 'Departure', activities: ['Last breakfast', 'Airport transfer'] }
    ]
  },
  {
    destination: 'New York',
    days: 4,
    budget: 'moderate',
    travelerType: 'friends',
    title: 'NYC Friends Getaway',
    summary: 'An action-packed 4-day trip through the Big Apple with your best friends.',
    highlights: [
      'Times Square neon lights',
      'Central Park picnic',
      'Brooklyn Bridge walk',
      'NYC nightlife tour',
      'Statue of Liberty view'
    ],
    itinerary: [
      { day: 1, title: 'Manhattan Basics', activities: ['Hotel check-in', 'Times Square', 'Broadway show'] },
      { day: 2, title: 'NYC Icons', activities: ['Central Park', 'Met Museum', 'Brooklyn Bridge'] },
      { day: 3, title: 'Neighborhoods', activities: ['SoHo shopping', 'Chinatown food', 'East Village nightlife'] },
      { day: 4, title: 'Last Day', activities: ['Statue of Liberty ferry', 'Farewell dinner', 'Departure'] }
    ]
  },
  {
    destination: 'Rome',
    days: 3,
    budget: 'luxury',
    travelerType: 'couple',
    title: 'Luxury Roman Holiday',
    summary: 'An elegant 3-day Roman escape staying in boutique hotels with private tours.',
    highlights: [
      'Private Vatican tour',
      'Colosseum underground access',
      'Trastevere dinner',
      'Trevi Fountain at night',
      'Borghese Gallery'
    ],
    itinerary: [
      { day: 1, title: 'Ancient Rome', activities: ['Colosseum exclusive access', 'Roman Forum', 'Panthon visit'] },
      { day: 2, title: 'Vatican Day', activities: ['Private Vatican Museums', 'Sistine Chapel', 'St Peters Basilica'] },
      { day: 3, title: 'Roman Dolce Vita', activities: ['Trevi Fountain', 'Spanish Steps', 'Trastevere romantic dinner'] }
    ]
  }
];

function generateSlug(destination: string, days: number, budget: string, travelerType: string): string {
  return `${destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${days}-days-${budget}-${travelerType}`;
}

async function seedDestinations() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not defined in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Plan.deleteMany({});
    console.log('Cleared existing plans');

    for (const plan of SAMPLE_PLANS) {
      const slug = generateSlug(plan.destination, plan.days, plan.budget, plan.travelerType);
      
      await Plan.create({
        ...plan,
        slug,
        status: 'completed'
      });
      console.log(`Created: ${plan.title}`);
    }

    console.log(`\nSeeded ${SAMPLE_PLANS.length} destinations successfully!`);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDestinations();
