interface ParsedPrompt {
  destination: string;
  days: number;
  budget: string;
  travelerType: string;
}

const TRAVELER_TYPES = [
  'solo',
  'couple',
  'family',
  'friends',
  'business',
  'adventure',
  'relaxation',
  'budget',
  'luxury',
];

const BUDGET_TYPES = [
  'budget',
  'moderate',
  'mid-range',
  'luxury',
  'expensive',
  'cheap',
  'affordable',
];

export function parsePrompt(prompt: string): ParsedPrompt {
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

export default parsePrompt;
