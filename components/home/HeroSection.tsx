"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import HeroBackgroundSlider from "./HeroBackgroundSlider"; 

const HeroSection = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    // 1. PERBAIKAN TINGGI: Di HP 500px (biar ga terlalu panjang), di Laptop 650px
    <div className="relative h-[500px] md:h-[650px] flex items-center justify-center overflow-hidden w-full">
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <HeroBackgroundSlider />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-[#0B2F5E]/30"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto mt-0 md:-mt-10">

        {/* Heading */}
        {/* 2. PERBAIKAN FONT: text-4xl (HP) -> text-5xl (Tablet) -> text-7xl (Laptop) */}
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 md:mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000"
          style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
        >
          Telusuri
          <br className="block md:hidden" /> {/* Enter di HP biar rapi */}
          <span className="text-[#F57C00] md:ml-3">Wisata Dunia</span>
        </h1>

        {/* Subtitle */}
        {/* 3. PERBAIKAN SUBTITLE: Ukuran text disesuaikan */}
        <p
          className="text-white text-sm sm:text-base md:text-xl mb-8 md:mb-12 max-w-xs sm:max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
        >
          Nikmati kemudahan pesan tiket wisata tanpa antre. Ribuan destinasi
          indah menunggu petualanganmu selanjutnya.
        </p>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearch}
          className="bg-white p-1.5 md:p-2.5 rounded-full shadow-2xl w-full max-w-sm md:max-w-3xl mx-auto flex items-center border-2 border-white/50 animate-in fade-in zoom-in duration-700 delay-200"
        >
          {/* Ikon Kaca Pembesar */}
          <div className="pl-3 md:pl-6 text-[#F57C00]">
            <Search className="w-5 h-5 md:w-7 md:h-7" />
          </div>
          
          {/* Input Field */}
          <input
            type="text"
            placeholder="Mau liburan ke mana?"
            className="flex-1 p-3 md:p-4 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm md:text-lg font-medium w-full min-w-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {/* Tombol Cari */}
          <button 
            type="submit"
            className="bg-[#F57C00] hover:bg-[#E65100] text-white p-3 md:px-8 md:py-4 rounded-full md:rounded-xl font-bold transition-all shadow-lg flex-shrink-0 active:scale-95 cursor-pointer"
          >
            {/* Teks muncul di Laptop, Icon muncul di HP */}
            <span className="hidden md:inline">Cari</span>
            <Search className="md:hidden w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default HeroSection;