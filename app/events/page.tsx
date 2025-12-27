'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // 👈 1. Import ini
import { Search, MapPin, Star, ChevronDown, Check, X, ArrowUpRight } from 'lucide-react';
import { Destination } from '@/types';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// --- KOMPONEN KONTEN UTAMA (Dipisah agar support Suspense) ---
function AllDestinationsContent() {
  const searchParams = useSearchParams(); // 👈 2. Ambil params URL
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  
  const [searchInput, setSearchInput] = useState(''); 
  const [activeSearch, setActiveSearch] = useState(''); 
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // --- 3. DETEKSI PENCARIAN DARI URL (HERO SECTION) ---
  useEffect(() => {
    const query = searchParams.get('search'); // Ambil ?search=...
    const categoryQuery = searchParams.get('category'); // Ambil ?category=...

    if (query) {
      setSearchInput(query);
      setActiveSearch(query);
    }
    
    if (categoryQuery) {
      setActiveCategory(categoryQuery);
    }
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
      } catch (err) {
        console.error('Gagal load data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, [BASE_URL]);

  const handleSearch = () => { setActiveSearch(searchInput); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearch(); };
  
  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  const handleResetTotal = () => {
      setSearchInput('');
      setActiveSearch('');
      setActiveCategory('Semua');
  };

  const filteredDestinations = destinations.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(activeSearch.toLowerCase()) || 
                        item.location.toLowerCase().includes(activeSearch.toLowerCase());
    const matchCategory = activeCategory === 'Semua' ? true : item.category?.name === activeCategory; 
    return matchSearch && matchCategory;
  });

  return (
    <>
      <Navbar />

      {/* HEADER & SEARCH AREA */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0B2F5E] mb-6">Jelajahi Semua Destinasi</h1>
            
            {/* SEARCH BAR */}
            <div className="flex flex-col md:flex-row gap-3">
                {/* DROPDOWN KATEGORI */}
                <div className="relative w-full md:w-56 z-30">
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full h-12 flex items-center justify-between px-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-[#0B2F5E] transition group"
                    >
                        <span className="text-sm font-semibold text-gray-700 truncate">
                            {activeCategory === 'Semua' ? 'Semua Kategori' : activeCategory}
                        </span>
                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95">
                                <button onClick={() => { setActiveCategory('Semua'); setIsDropdownOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center justify-between text-gray-700">
                                    <span className={activeCategory === 'Semua' ? 'font-bold text-[#0B2F5E]' : ''}>Semua Kategori</span>
                                    {activeCategory === 'Semua' && <Check size={16} className="text-[#0B2F5E]" />}
                                </button>
                                {categories.map((cat) => (
                                    <button key={cat.id} onClick={() => { setActiveCategory(cat.name); setIsDropdownOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center justify-between text-gray-700">
                                        <span className={activeCategory === cat.name ? 'font-bold text-[#0B2F5E]' : ''}>{cat.name}</span>
                                        {activeCategory === cat.name && <Check size={16} className="text-[#0B2F5E]" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* INPUT PENCARIAN */}
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari pantai, gunung, atau kota..."
                        className="w-full h-12 pl-12 pr-12 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0B2F5E] focus:ring-2 focus:ring-blue-100 outline-none transition font-medium text-gray-800"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleKeyDown} 
                    />
                    {searchInput && (
                        <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <button onClick={handleSearch} className="h-12 px-8 bg-[#0B2F5E] text-white font-bold rounded-xl hover:bg-[#09254A] transition shadow-md active:scale-95">
                    Cari
                </button>
            </div>
        </div>
      </div>

      {/* HASIL PENCARIAN */}
      <div className="max-w-7xl mx-auto px-4 py-10 min-h-[60vh]">
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 bg-gray-200 rounded-3xl"></div>)}
            </div>
        ) : filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDestinations.map((item) => (
                    // 4. KARTU BISA DIKLIK (FULL LINK)
                    <Link href={`/events/${item.slug}`} key={item.id} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col h-full">
                        <div className="relative h-56 overflow-hidden bg-gray-100">
                            <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-3 left-3"><span className="bg-white/95 backdrop-blur-sm text-[#0B2F5E] text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border border-gray-100 uppercase tracking-wide">{item.category?.name || 'Umum'}</span></div>
                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-gray-800 shadow-sm"><Star size={12} className="text-orange-500 fill-orange-500"/>{item.rating ? Number(item.rating).toFixed(1) : 'New'}</div>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-[#0B2F5E] transition-colors">{item.name}</h3>
                            <p className="flex items-center gap-1 text-gray-500 text-xs mb-4"><MapPin size={14} className="text-[#F57C00]" /> {item.location}</p>
                            
                            <div className="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between">
                                <div>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase block">Mulai dari</span>
                                    <span className="text-lg font-bold text-[#F57C00]">{formatRupiah(item.price)}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0B2F5E] group-hover:bg-[#0B2F5E] group-hover:text-white transition-colors">
                                    <ArrowUpRight size={18} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Search size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Tidak ditemukan</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Penelusuran untuk "<strong>{activeSearch}</strong>" di kategori "{activeCategory}" tidak membuahkan hasil.</p>
                <button onClick={handleResetTotal} className="px-6 py-2.5 bg-[#0B2F5E] text-white font-bold rounded-xl hover:bg-[#09254A] transition shadow-lg shadow-blue-900/20">Reset Semua Filter</button>
            </div>
        )}
      </div>
      <Footer />
    </>
  );
}

// 5. EXPORT DEFAULT DENGAN SUSPENSE
// Ini wajib agar build tidak error saat menggunakan useSearchParams
export default function AllDestinationsPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B2F5E]"></div></div>}>
                <AllDestinationsContent />
            </Suspense>
        </main>
    );
}