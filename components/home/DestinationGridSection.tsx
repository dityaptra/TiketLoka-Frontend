'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// Gunakan 'any' sementara jika tipe data belum fix
// import { Destination } from '@/types'; 
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
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 md:h-10 w-48 md:w-64 bg-gray-200 rounded-lg animate-pulse mb-6 md:mb-10"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 h-[380px]">
              <div className="h-44 bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                <div className="mt-4 h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (destinations.length === 0) return (
    <div className="py-20 text-center px-4">
      <p className="text-gray-400 font-medium bg-gray-50 py-8 rounded-xl border border-dashed border-gray-300">
        Belum ada destinasi untuk kategori ini.
      </p>
    </div>
  );

  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 md:mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500 text-sm md:text-base">Tempat wisata terfavorit pilihan traveler</p>
          </div>
          
          {limit && (
            <Link href="/events" className="hidden sm:flex items-center gap-2 text-[#FF5B00] font-bold hover:underline transition-all">
              Lihat Semua <ArrowUpRight size={18} />
            </Link>
          )}
        </div>
        
        {/* GRID KARTU (CLEAN & REAL DATA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((item) => {
            // Logika aman mengambil nama kategori
            const categoryName = typeof item.category === 'object' && item.category !== null 
                ? item.category.name 
                : (item.category || 'Wisata');

            return (
                <Link 
                  href={`/events/${item.slug}`} 
                  key={item.id} 
                  className="group block bg-white rounded-xl overflow-hidden border border-gray-300 hover:-translate-y-2 transition duration-200 h-full flex-col"
                >
                  {/* IMAGE SECTION */}
                  <div className="relative h-44 overflow-hidden bg-gray-100 border-b border-gray-100">
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
                      }}
                    />
                    {/* Label Lokasi */}
                    <div className="absolute top-3 left-3">
                        <span className="bg-black/60 backdrop-blur-[2px] text-white text-[10px] font-bold px-2 py-1 rounded-[4px] flex items-center gap-1">
                            <MapPin size={10} /> {item.location ? item.location.split(',')[0] : 'Indonesia'}
                        </span>
                    </div>
                  </div>

                  {/* CONTENT SECTION */}
                  <div className="p-3 pt-4 flex flex-col flex-1">
                    {/* Kategori */}
                    <span className="text-[11px] text-gray-400 mb-1 block uppercase tracking-wide">
                        {categoryName}
                    </span>

                    {/* Judul */}
                    <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#FF5B00] transition-colors">
                      {item.name}
                    </h3>
                    
                    {/* Rating (Hanya Tampil Jika Ada Data Rating Asli) */}
                    <div className="flex items-center gap-1.5 mb-4">
                        <div className="flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                            <Star size={10} className="fill-[#FFB800] text-[#FFB800]" />
                            <span className="text-xs font-bold text-[#FFB800]">
                                {item.rating ? Number(item.rating).toFixed(1) : 'New'}
                            </span>
                        </div>
                    </div>

                    {/* Harga Asli */}
                    <div className="mt-auto border-t border-dashed border-gray-100 pt-3 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium">Mulai dari</span>
                        <span className="text-lg font-bold text-[#FF5B00]">
                          {formatRupiah(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
            );
          })}
        </div>

        {/* TOMBOL LIHAT SEMUA (MOBILE ONLY) */}
        {limit && (
          <div className="mt-8 sm:hidden">
            <Link href="/events">
              <button className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2">
                Lihat Semua
                <ArrowUpRight size={16} />
              </button>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}