'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Star, ArrowUpRight } from 'lucide-react';

export default function DestinationGridSection({ endpoint, title, limit }: { endpoint: string, title: string, limit?: number }) {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    const finalPath = cleanPath.startsWith('storage/') ? cleanPath.substring(8) : cleanPath;
    return `${BASE_URL}/storage/${finalPath}`;
  };

  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(endpoint);
        const json = await res.json();
        let data = json.data || [];
        
        if (limit && data.length > limit) {
          data = data.slice(0, limit);
        }
        
        setDestinations(data);
      } catch (err) {
        console.error(`Gagal fetching data`, err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [endpoint, limit]);

  if (loading) return (
    <section className="py-6 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-6 md:h-10 w-32 md:w-64 bg-gray-200 rounded-lg animate-pulse mb-4 md:mb-10"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <div className="h-32 md:h-44 bg-gray-200 animate-pulse"></div>
              <div className="p-3 space-y-2">
                <div className="h-3 md:h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-2 md:h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                <div className="mt-3 h-4 md:h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (destinations.length === 0) return (
    <div className="py-12 text-center px-4">
      <p className="text-gray-400 font-medium bg-gray-50 py-6 rounded-xl border border-dashed border-gray-300 text-sm md:text-base">
        Belum ada destinasi untuk kategori ini.
      </p>
    </div>
  );

  return (
    <section className="py-6 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-4 md:mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{title}</h2>
            <p className="text-gray-500 text-xs md:text-base hidden md:block">Tempat wisata terfavorit pilihan traveler</p>
          </div>
          
          {/* UBAH 1: Tambahkan 'hidden md:flex' agar tombol ini HILANG di mobile */}
          {limit && (
            <Link href="/events" className="hidden md:flex items-center gap-1 md:gap-2 text-[#FF5B00] font-bold hover:underline transition-all text-sm md:text-base">
              Lihat Semua <ArrowUpRight size={16} className="md:w-[18px] md:h-[18px]" />
            </Link>
          )}
        </div>
        
        {/* GRID KARTU */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {destinations.map((item) => {
            const categoryName = typeof item.category === 'object' && item.category !== null 
                ? item.category.name 
                : (item.category || 'Wisata');

            return (
                <Link 
                  href={`/events/${item.slug}`} 
                  key={item.id} 
                  className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#FF5B00]/30 md:border-gray-300 hover:-translate-y-1 md:hover:-translate-y-2 transition duration-200 flex flex-col shadow-sm hover:shadow-md"
                >
                  {/* IMAGE SECTION */}
                  <div className="relative h-32 md:h-44 overflow-hidden bg-gray-100 border-b border-gray-100">
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
                      }}
                    />
                    <div className="absolute top-2 left-2 md:top-3 md:left-3">
                        <span className="bg-black/50 backdrop-blur-[2px] text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-[4px] flex items-center gap-0.5 md:gap-1">
                            <MapPin size={8} className="md:w-[10px] md:h-[10px]" /> {item.location ? item.location.split(',')[0] : 'Indonesia'}
                        </span>
                    </div>
                  </div>

                  {/* CONTENT SECTION */}
                  <div className="p-2 md:p-3 pt-3 md:pt-4 flex flex-col flex-1">
                    <span className="text-[10px] md:text-[11px] text-gray-400 mb-0.5 md:mb-1 block uppercase tracking-wide truncate">
                        {categoryName}
                    </span>
                    <h3 className="text-sm md:text-[15px] font-bold text-gray-900 leading-tight md:leading-snug mb-1.5 md:mb-2 line-clamp-2 group-hover:text-[#FF5B00] transition-colors">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 mb-2 md:mb-4">
                        <div className="flex items-center gap-0.5 bg-orange-50 px-1 py-0.5 md:px-1.5 rounded border border-orange-100">
                            <Star size={8} className="fill-[#FFB800] text-[#FFB800] md:w-[10px] md:h-[10px]" />
                            <span className="text-[10px] md:text-xs font-bold text-[#FFB800]">
                                {item.rating ? Number(item.rating).toFixed(1) : 'New'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-auto pt-2 md:pt-3 flex flex-col">
                        <span className="text-[9px] md:text-[10px] text-gray-400 font-medium">Mulai dari</span>
                        <span className="text-sm md:text-lg font-bold text-[#FF5B00]">
                          {formatRupiah(item.price)}
                        </span>
                    </div>
                  </div>
                </Link>
            );
          })}
        </div>

        {/* UBAH 2: TOMBOL LIHAT SEMUA ALA KLOOK (Hanya di Mobile) */}
        {limit && (
          <div className="mt-4 md:hidden">
            <Link 
              href="/events" 
              className="block w-full py-3 text-center border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Lihat semua
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}