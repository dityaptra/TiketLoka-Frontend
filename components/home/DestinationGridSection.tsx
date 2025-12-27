'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Destination } from '@/types'; 
// 👇 Import icon tambahan untuk tampilan card baru
import { MapPin, Star, ArrowUpRight, Zap, Tag } from 'lucide-react';

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
        
        {/* --- 1. HEADER SECTION --- */}
        <div className="mb-8 md:mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500 text-sm md:text-base">Tempat wisata terfavorit pilihan traveler</p>
          </div>
          
          {/* Tombol Lihat Semua (Desktop Only) */}
          {limit && (
            <Link href="/events" className="hidden sm:flex items-center gap-2 text-[#FF5B00] font-bold hover:underline transition-all">
              Lihat Semua <ArrowUpRight size={18} />
            </Link>
          )}
        </div>
        
        {/* --- 2. GRID KARTU (TAMPILAN BARU - CLEAN & BORDERED) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((item) => (
            <Link 
              href={`/events/${item.slug}`} 
              key={item.id} 
              // 👇 Style Card: Border, Rounded, No Shadow Hover
              className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors duration-200 h-full flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-44 overflow-hidden bg-gray-100 border-b border-gray-100">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
                  }}
                />
                
                {/* Label Lokasi */}
                <div className="absolute top-3 left-3">
                    <span className="bg-black/60 backdrop-blur-[2px] text-white text-[10px] font-bold px-2 py-1 rounded-[4px] flex items-center gap-1">
                        <MapPin size={10} /> {item.location.split(',')[0]}
                    </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-3 pt-4 flex flex-col flex-1">
                {/* Kategori Kecil */}
                <span className="text-[11px] text-gray-400 mb-1 block">
                    {item.category || 'Wisata & Tur'} • Indonesia
                </span>

                {/* Judul Produk */}
                <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#FF5B00] transition-colors">
                  {item.name}
                </h3>
                
                {/* Rating & Review */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex items-center gap-0.5">
                        <Star size={12} className="fill-[#FFB800] text-[#FFB800]" />
                        <span className="text-sm font-bold text-[#FFB800]">{item.rating ? Number(item.rating).toFixed(1) : '5.0'}</span>
                    </div>
                    {/* Menggunakan ID untuk angka random statis */}
                    <span className="text-xs text-gray-400">({(item.id * 17) % 300 + 50}) • 2K+ dipesan</span>
                </div>

                {/* Fitur Kilat */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 text-[10px] px-1.5 py-0.5 rounded border border-gray-100">
                        <Zap size={10} className="text-orange-500 fill-orange-500" /> Konfirmasi Instan
                    </span>
                </div>

                {/* Harga Section */}
                <div className="mt-auto border-t border-dashed border-gray-100 pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-gray-400 line-through">
                         {formatRupiah(Number(item.price) * 1.2)}
                    </span>
                    <span className="text-lg font-bold text-[#FF5B00]">
                      {formatRupiah(item.price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                      {/* Label Diskon */}
                      <div className="flex items-center gap-1 text-[10px] text-[#FF5B00] font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                          <Tag size={10} /> Hemat 20%
                      </div>
                      <span className="text-[10px] text-gray-400">/ orang</span>
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