interface UnsplashImage {
  url: string;
  photographer: string;
  source: string;
}

const FALLBACK_IMAGE: UnsplashImage = {
  url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  photographer: 'Unsplash',
  source: 'Unsplash',
};

export async function fetchHeroImage(destination: string): Promise<UnsplashImage> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY not configured, using fallback image');
    return FALLBACK_IMAGE;
  }

  try {
    const query = encodeURIComponent(`${destination} landscape travel`);
    const url = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${accessKey}`;

    const response = await fetch(url, {
      headers: {
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      console.warn(`Unsplash API error: ${response.status}, using fallback`);
      return FALLBACK_IMAGE;
    }

    const data = await response.json();

    return {
      url: data.urls?.regular || data.urls?.full || FALLBACK_IMAGE.url,
      photographer: data.user?.name || 'Unknown',
      source: 'Unsplash',
    };
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return FALLBACK_IMAGE;
  }
}

export default fetchHeroImage;
