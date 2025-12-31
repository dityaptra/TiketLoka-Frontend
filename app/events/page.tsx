'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; 
import { Search, MapPin, Star, ChevronDown, Check, X } from 'lucide-react'; 
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// --- KOMPONEN KONTEN UTAMA ---
function AllDestinationsContent() {
  const searchParams = useSearchParams();
  
  const [destinations, setDestinations] = useState<any[]>([]);
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
    
    let itemCategoryName = 'Umum';
    if (item.category) {
        if (typeof item.category === 'string') itemCategoryName = item.category;
        else if (typeof item.category === 'object') itemCategoryName = item.category.name;
    }

    const matchCategory = activeCategory === 'Semua' ? true : itemCategoryName === activeCategory; 
    return matchSearch && matchCategory;
  });

  return (
    <>
      <Navbar />

      {/* HEADER & SEARCH AREA */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto py-4 md:py-5 px-4">
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
                            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
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

      {/* HASIL PENCARIAN */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 min-h-[60vh]">
        {loading ? (
             // SKELETON LOADER (Disamakan dengan Grid Baru)
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 animate-pulse">
                {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100">
                        <div className="h-32 md:h-44 bg-gray-200 mb-2"></div>
                        <div className="p-3 space-y-2">
                            <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        ) : filteredDestinations.length > 0 ? (
            // GRID BARU: 2 Kolom Mobile, 4 Desktop
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {filteredDestinations.map((item) => {
                      const categoryName = typeof item.category === 'object' && item.category !== null 
                        ? item.category.name 
                        : (item.category || 'Wisata');

                      return (
                        <Link 
                            href={`/events/${item.slug}`} 
                            key={item.id} 
                            className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#FF5B00]/30 md:border-gray-300 transition hover:-translate-y-1 md:hover:-translate-y-2 duration-200 flex flex-col h-full shadow-sm hover:shadow-md"
                        >
                            {/* IMAGE SECTION (Kecil di Mobile) */}
                            <div className="relative h-32 md:h-44 overflow-hidden bg-gray-100 border-b border-gray-100">
                                <img 
                                    src={getImageUrl(item.image_url)} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
                                    }}
                                />
                                
                                {/* Label Lokasi (Font Kecil) */}
                                <div className="absolute top-2 left-2 md:top-3 md:left-3">
                                    <span className="bg-black/60 backdrop-blur-[2px] text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-[4px] flex items-center gap-0.5 md:gap-1">
                                        <MapPin size={8} className="md:w-[10px] md:h-[10px]" /> 
                                        {item.location ? item.location.split(',')[0] : 'Indonesia'}
                                    </span>
                                </div>
                            </div>

                            {/* CONTENT SECTION (Padding & Font Kecil di Mobile) */}
                            <div className="p-2 md:p-3 pt-3 md:pt-4 flex flex-col flex-1">
                                {/* Kategori */}
                                <span className="text-[10px] md:text-[11px] text-gray-400 mb-0.5 md:mb-1 block uppercase tracking-wide truncate">
                                    {categoryName}
                                </span>

                                {/* Judul */}
                                <h3 className="text-sm md:text-[15px] font-bold text-gray-900 leading-tight md:leading-snug mb-1.5 md:mb-2 line-clamp-2 group-hover:text-[#FF5B00] transition-colors">
                                    {item.name}
                                </h3>

                                {/* Rating */}
                                <div className="flex items-center gap-1.5 mb-2 md:mb-4">
                                    <div className="flex items-center gap-0.5 bg-orange-50 px-1 py-0.5 md:px-1.5 rounded border border-orange-100">
                                        <Star size={8} className="fill-[#FFB800] text-[#FFB800] md:w-[10px] md:h-[10px]" />
                                        <span className="text-[10px] md:text-xs font-bold text-[#FFB800]">
                                            {item.rating ? Number(item.rating).toFixed(1) : 'New'}
                                        </span>
                                    </div>
                                </div>

                                {/* Harga Asli */}
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

// EXPORT
export default function AllDestinationsPage() {
    return (
        <main className="min-h-screen bg-white font-sans text-gray-900 pt-20">
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>}>
                <AllDestinationsContent />
            </Suspense>
        </main>
    );
}