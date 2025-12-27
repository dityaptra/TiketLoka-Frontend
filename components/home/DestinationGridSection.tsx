'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Destination } from '@/types'; 
import { MapPin, Star, ArrowUpRight } from 'lucide-react';

export default function DestinationGridSection({ endpoint, title, limit }: { endpoint: string, title: string, limit?: number }) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // --- Helper: URL Gambar ---
  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    const finalPath = cleanPath.startsWith('storage/') ? cleanPath.substring(8) : cleanPath;
    return `${BASE_URL}/storage/${finalPath}`;
  };

  // --- Helper: Format Rupiah ---
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

  // --- RENDER SKELETON LOADING ---
  if (loading) return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 md:h-10 w-48 md:w-64 bg-gray-200 rounded-lg animate-pulse mb-6 md:mb-10"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[350px]">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                <div className="mt-4 h-8 w-full bg-gray-200 rounded animate-pulse"></div>
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
        
        {/* --- 1. HEADER SECTION --- */}
        <div className="mb-8 md:mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600 text-sm md:text-base">Tempat wisata terfavorit pilihan traveler</p>
          </div>
          
          {/* Tombol Lihat Semua (Desktop Only) */}
          {limit && (
            <Link href="/events" className="hidden sm:flex items-center gap-2 text-[#0B2F5E] font-bold hover:underline">
              Lihat Semua <ArrowUpRight size={18} />
            </Link>
          )}
        </div>
        
        {/* --- 2. GRID KARTU --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((item) => (
            <Link 
              href={`/events/${item.slug}`} 
              key={item.id} 
              className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 h-full flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
                  }}
                />
                
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                  <Star size={12} fill="#F57C00" className="text-[#F57C00]" />
                  <span className="text-xs font-bold text-gray-800">
                    {item.rating ? Number(item.rating).toFixed(1) : 'New'}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-[#0B2F5E] transition-colors">
                  {item.name}
                </h3>
                
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1 line-clamp-1">
                  <MapPin size={14} className="text-[#F57C00] flex-shrink-0"/>
                  {item.location}
                </p>

                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Mulai dari</span>
                    <p className="text-lg font-bold text-[#F57C00]">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                  
                  {/* Icon Panah Kecil sebagai indikator klik */}
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-[#0B2F5E] group-hover:bg-[#0B2F5E] group-hover:text-white transition-colors">
                     <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* --- 3. TOMBOL LIHAT SEMUA (MOBILE ONLY) --- */}
        {limit && (
          <div className="mt-8 sm:hidden">
            <Link href="/events">
              <button className="w-full py-3.5 bg-white border border-[#0B2F5E] text-[#0B2F5E] rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
                Lihat Semua Destinasi
                <ArrowUpRight size={16} />
              </button>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}