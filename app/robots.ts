import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.tiketloka.web.id';

  return {
    rules: {
      userAgent: '*',     // Aturan ini berlaku untuk SEMUA bot (Google, Bing, Yahoo, dll)
      allow: '/',         // Boleh masuk ke semua halaman...
      disallow: [         // ...KECUALI halaman-halaman rahasia ini:
        '/admin/',        
        '/payment/',      
        '/tickets/',      
        '/profile/',      
        '/auth/',         
        '/api/',          
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}