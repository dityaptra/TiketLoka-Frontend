import { MetadataRoute } from 'next';
export const dynamic = 'force-dynamic';

const WEB_BASE_URL = 'https://tiketloka.web.id'; 
const API_BASE_URL = 'https://api.tiketloka.web.id'; 

// Fungsi Fetch Data semua wisata dari Laravel
async function getAllDestinations() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/destinations?limit=1000`, {
      cache: 'no-store',
    });
    
    if (!res.ok) return [];
    
    const json = await res.json();
    // Pastikan struktur JSON backend kamu benar (json.data)
    return json.data || [];
  } catch (error) {
    console.error("Gagal generate sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Ambil data wisata dari Database
  const destinations = await getAllDestinations();

  // 2. Buat URL Dinamis untuk setiap wisata
  const destinationUrls = destinations.map((item: any) => ({
    url: `${WEB_BASE_URL}/events/${item.slug}`, 
    lastModified: new Date(item.updated_at || new Date()), 
    changeFrequency: 'weekly' as const, 
    priority: 0.8, 
  }));

  // 3. Buat URL Statis (Halaman Tetap)
  const staticUrls = [
    {
      url: WEB_BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${WEB_BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  return [...staticUrls, ...destinationUrls];
}