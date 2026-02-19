export function generateSlug(destination: string, days: number, budget: string, travelerType: string): string {
  const base = `${destination.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${days}-days-${budget}-${travelerType}`;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${timestamp}-${random}`;
}

export default generateSlug;
