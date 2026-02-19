const TRAVEL_KEYWORDS = [
  'trip', 'travel', 'visit', 'vacation', 'holiday', 'tour', 'destination',
  'itinerary', 'plan', 'journey', 'explore', 'adventure', 'fly', 'flight',
  'hotel', 'accommodation', 'flight', 'resort', 'beach', 'mountain', 'city',
  'country', 'abroad', 'overseas', 'cruise', 'road trip', 'backpacking',
];

export function isTravelRelated(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();
  
  const basicPattern = /^\d+\s*(days?|nights?|weeks?)\s+(?:in|at|to|for)\s+/i;
  if (basicPattern.test(prompt)) {
    return true;
  }
  
  const matchCount = TRAVEL_KEYWORDS.filter(keyword => 
    lowerPrompt.includes(keyword)
  ).length;
  return matchCount >= 1;
}

export default isTravelRelated;
