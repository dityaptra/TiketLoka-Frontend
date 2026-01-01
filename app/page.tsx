"use client";

import { useState } from "react";
import {
  TrendingUp,
  Calendar,
  Shield,
  Headphones,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DestinationGridSection from "@/components/home/DestinationGridSection";
import CategoryFilter from "@/components/home/CategoryFilter";
import HeroSection from "@/components/home/HeroSection";
import FeatureCard from "@/components/home/FeatureCard";
import CTASection from "@/components/home/CTASection";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const destinationEndpoint = selectedCategory
    ? `/api/destinations?category=${selectedCategory}`
    : "/api/destinations";

  const sectionTitle = selectedCategory 
    ? `Wisata di ${selectedCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
    : "Destinasi Populer";

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden pt-15">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. CATEGORY FILTER (Sticky Effect Adjustment) */}
      <div className="relative z-20 -mt-6 md:-mt-10 px-4 mb-8">
         <div className="max-w-7xl mx-auto"> 
            <CategoryFilter 
              selectedSlug={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
         </div>
      </div>

      {/* 3. DESTINATION GRID */}
      <DestinationGridSection
        endpoint={destinationEndpoint}
        title={sectionTitle}
        limit={4}
      />

      {/* 4. FITUR SECTION */}
      <section className="py-16 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B2F5E] mb-4">
              Kenapa Pilih TiketLoka?
            </h2>
            <p className="text-gray-600 text-base md:text-lg">
              Kami menjamin pengalaman liburan terbaik dengan pelayanan standar internasional.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <FeatureCard icon={TrendingUp} title="Harga Terbaik" description="Jaminan harga termurah dengan promo menarik setiap harinya." />
            <FeatureCard icon={Calendar} title="Booking Mudah" description="Pesan tiket dalam hitungan detik, konfirmasi instan ke email." />
            <FeatureCard icon={Shield} title="Transaksi Aman" description="Pembayaran terenkripsi dan terjamin keamanannya 100%." />
            <FeatureCard icon={Headphones} title="Layanan 24/7" description="Tim support kami siap membantu kapanpun Anda butuh." />
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION (ANIMATED GRID) */}
      <CTASection />

      <Footer />
    </main>
  );
}