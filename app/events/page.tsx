'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; 
import { Search, MapPin, Star, ChevronDown, Check, X, Zap, Tag } from 'lucide-react'; 
import { Destination } from '@/types';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// --- KOMPONEN KONTEN UTAMA ---
function AllDestinationsContent() {
  const searchParams = useSearchParams();
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  
  const [searchInput, setSearchInput] = useState(''); 
  const [activeSearch, setActiveSearch] = useState(''); 
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const query = searchParams.get('search');
    const categoryQuery = searchParams.get('category');
    if (query) { setSearchInput(query); setActiveSearch(query); }
    if (categoryQuery) { setActiveCategory(categoryQuery); }
  }, [searchParams]);

  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    const finalPath = cleanPath.startsWith('storage/') ? cleanPath.substring(8) : cleanPath;
    return `${BASE_URL}/storage/${finalPath}`;
  };

  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(price));
  };

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const [resDest, resCat] = await Promise.all([
            fetch(`${BASE_URL}/api/destinations`),
            fetch(`${BASE_URL}/api/categories`)
        ]);
        const jsonDest = await resDest.json();
        const jsonCat = await resCat.json();
        setDestinations(jsonDest.data || []);
        setCategories(jsonCat.data || []);
      } catch (err) { console.error('Gagal load data', err); } finally { setLoading(false); }
    }
    fetchInitialData();
  }, [BASE_URL]);

  const handleSearch = () => { setActiveSearch(searchInput); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearch(); };
  const handleClearSearch = () => { setSearchInput(''); setActiveSearch(''); };
  const handleResetTotal = () => { setSearchInput(''); setActiveSearch(''); setActiveCategory('Semua'); };

  const filteredDestinations = destinations.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(activeSearch.toLowerCase()) || 
                        item.location.toLowerCase().includes(activeSearch.toLowerCase());
    const matchCategory = activeCategory === 'Semua' ? true : item.category?.name === activeCategory; 
    return matchSearch && matchCategory;
  });

  return (
    <>
      <Navbar />

      {/* HEADER & SEARCH AREA (Sticky) */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto py-5 px-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Jelajahi Dunia 
                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full border border-orange-200">50+ Destinasi</span>
            </h1>
            
            <div className="flex flex-col md:flex-row gap-3">
                {/* Dropdown Kategori */}
                <div className="relative w-full md:w-56 z-40">
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full h-11 flex items-center justify-between px-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-[#0B2F5E] transition text-sm font-medium text-gray-700"
                    >
                        <span className="truncate">{activeCategory === 'Semua' ? 'Semua Kategori' : activeCategory}</span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95">
                                <button onClick={() => { setActiveCategory('Semua'); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 hover:text-orange-600 flex items-center justify-between transition-colors">
                                    <span className={activeCategory === 'Semua' ? 'font-bold' : ''}>Semua</span>
                                    {activeCategory === 'Semua' && <Check size={14} />}
                                </button>
                                {categories.map((cat) => (
                                    <button key={cat.id} onClick={() => { setActiveCategory(cat.name); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 hover:text-orange-600 flex items-center justify-between transition-colors">
                                        <span className={activeCategory === cat.name ? 'font-bold' : ''}>{cat.name}</span>
                                        {activeCategory === cat.name && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Input Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari aktivitas atau destinasi..."
                        className="w-full h-11 pl-10 pr-10 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm text-gray-800"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleKeyDown} 
                    />
                    {searchInput && (
                        <button onClick={handleClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <button onClick={handleSearch} className="h-11 px-6 bg-[#FF5B00] hover:bg-[#E65200] text-white font-bold rounded-lg transition shadow-sm active:scale-95 text-sm">
                    Cari
                </button>
            </div>
        </div>
      </div>

      {/* HASIL PENCARIAN - STYLE CLEAN & BORDERED */}
      <div className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8 animate-pulse">
                {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i}>
                        <div className="h-44 bg-gray-200 rounded-t-xl mb-3"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        ) : filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
                {filteredDestinations.map((item) => (
                    <Link 
                        href={`/events/${item.slug}`} 
                        key={item.id} 
                        // 👇 PERUBAHAN STYLE KARTU DI SINI:
                        // - Hapus shadow-md, ganti border border-gray-200
                        // - Hapus hover:-translate-y
                        className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                    >
                        {/* 1. IMAGE SECTION */}
                        <div className="relative h-44 overflow-hidden bg-gray-100 border-b border-gray-100">
                            <img 
                                src={getImageUrl(item.image_url)} 
                                alt={item.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            
                            {/* Label Lokasi */}
                            <div className="absolute top-3 left-3">
                                <span className="bg-black/60 backdrop-blur-[2px] text-white text-[10px] font-bold px-2 py-1 rounded-[4px] flex items-center gap-1">
                                    <MapPin size={10} /> {item.location.split(',')[0]}
                                </span>
                            </div>
                            
                            {/* ❌ LABEL PROMO SPESIAL SUDAH DIHAPUS ❌ */}
                        </div>

                        {/* 2. CONTENT SECTION */}
                        <div className="p-3 pt-4 flex flex-col h-[calc(100%-176px)]">
                            {/* Kategori Kecil */}
                            <span className="text-[11px] text-gray-400 mb-1 block">
                                {item.category?.name || 'Wisata & Tur'} • Indonesia
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
                                <span className="text-xs text-gray-400">({Math.floor(Math.random() * 500) + 50}) • 2K+ dipesan</span>
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
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                    <Search size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Tidak ditemukan</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">Coba ganti kata kunci pencarian atau reset filter.</p>
                <button onClick={handleResetTotal} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-sm transition">Reset Filter</button>
            </div>
        )}
      </div>
      <Footer />
    </>
  );
}

// 5. EXPORT DEFAULT DENGAN SUSPENSE
export default function AllDestinationsPage() {
    return (
        <main className="min-h-screen bg-white font-sans text-gray-900">
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>}>
                <AllDestinationsContent />
            </Suspense>
        </main>
    );
}