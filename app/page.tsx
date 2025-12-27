"use client";

import { useState } from "react";
import { motion } from "framer-motion"; 
import Link from 'next/link';
import Image from "next/image"; // Gunakan Image dari Next.js untuk performa
import {
  TrendingUp,
  Calendar,
  Shield,
  Headphones,
  LucideIcon,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DestinationGridSection from "@/components/home/DestinationGridSection";
import CategoryFilter from "@/components/home/CategoryFilter"; // Pastikan nama file diperbaiki (Typo: Categroy -> Category)
import HeroSection from "@/components/home/HeroSection"; 

// --- DATA GAMBAR WISATA ---
const galleryImages = [
  {
    src: "/images/candiprambanan.avif",
    alt: "Candi Prambanan",
  },
  {
    src: "/images/herobg/gunungbromo.avif",
    alt: "Gunung Bromo",
  },
  {
    src: "/images/candiborobudur3.webp",
    alt: "Candi Borobudur",
  },
  {
    src: "/images/herobg/pulau.webp",
    alt: "Pulau Padar",
  },
  {
    src: "/images/gwk.jpg",
    alt: "GWK Bali",
  },
  {
    src: "/images/pulaukomodo.jpeg",
    alt: "Pulau Komodo",
  },
];

// --- KOMPONEN FITUR CARD ---
const FeatureCard = ({ icon: Icon, title, description }: { icon: LucideIcon, title: string, description: string }) => (
  <div className="relative group overflow-hidden bg-[#F57C00] p-6 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:-rotate-1 hover:shadow-xl hover:shadow-orange-500/40 border border-orange-400/20">
    <div className="absolute inset-0 opacity-10" 
         style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
    </div>
    <div className="absolute -bottom-4 -right-4 text-white opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
      <Icon size={100} strokeWidth={1.5} />
    </div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-600/20 transition-transform duration-300 group-hover:scale-110">
        <Icon size={24} className="text-[#F57C00]" strokeWidth={2.5} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-orange-50 text-sm font-medium leading-relaxed opacity-90">
        {description}
      </p>
    </div>
  </div>
);

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const destinationEndpoint = selectedCategory
    ? `/api/destinations?category=${selectedCategory}`
    : "/api/destinations";

  const sectionTitle = selectedCategory 
    ? `Wisata di ${selectedCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
    : "Destinasi Populer";

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={TrendingUp} title="Harga Terbaik" description="Jaminan harga termurah dengan promo menarik setiap harinya." />
            <FeatureCard icon={Calendar} title="Booking Mudah" description="Pesan tiket dalam hitungan detik, konfirmasi instan ke email." />
            <FeatureCard icon={Shield} title="Transaksi Aman" description="Pembayaran terenkripsi dan terjamin keamanannya 100%." />
            <FeatureCard icon={Headphones} title="Layanan 24/7" description="Tim support kami siap membantu kapanpun Anda butuh." />
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION (ANIMATED GRID) */}
      <section className="py-16 md:py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto bg-[#0B2F5E] rounded-[2.5rem] overflow-hidden relative shadow-2xl">
          
          {/* Pattern Overlay */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>

          <div className="flex flex-col lg:flex-row items-center justify-between p-8 md:p-14 gap-12 relative z-10">
            
            {/* Bagian Kiri: Text */}
            <div className="lg:w-5/12 text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold uppercase tracking-wider mb-4 border border-orange-500/30">
                  Promo Spesial
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                  Liburan Impian<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F57C00] to-orange-300">Dimulai Disini</span>
                </h2>
                <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed">
                  Jangan biarkan rutinitas menghalangi petualanganmu. Temukan surga tersembunyi di Indonesia bersama TiketLoka.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/events">
                    <button className="bg-[#F57C00] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#E65100] transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/30 flex items-center gap-2">
                      Pesan Tiket Sekarang
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Bagian Kanan: Animated Image Grid */}
            <div className="lg:w-7/12 w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1, 
                      type: "spring",
                      stiffness: 100 
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                    // Class responsive: tinggi diatur agar tidak gepeng di HP
                    className="relative group overflow-hidden rounded-2xl h-32 sm:h-40 md:h-48 shadow-lg border-2 border-white/10"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}