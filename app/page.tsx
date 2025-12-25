"use client";

import { useState } from "react";
// Import framer-motion untuk animasi scroll
import { motion } from "framer-motion"; 
import Link from 'next/link';
import {
  TrendingUp,
  Calendar,
  Shield,
  Headphones,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DestinationGridSection from "@/components/home/DestinationGridSection";
import CategoryFilter from "@/components/home/CategroyFilter";
import HeroSection from "@/components/home/HeroSection"; 

// --- DATA GAMBAR WISATA HD (Untuk Grid Animasi) ---
const galleryImages = [
  {
    src: "/images/candiprambanan.avif?auto=format&fit=crop&w=600&q=80",
    alt: "Pura Ulun Danu Bedugul",
  },
  {
    src: "/images/herobg/gunungbromo.avif?auto=format&fit=crop&w=600&q=80",
    alt: "Nusa Penida Beach",
  },
  {
    src: "/images/candiborobudur3.webp?auto=format&fit=crop&w=600&q=80",
    alt: "Ubud Rice Terrace",
  },
  {
    src: "/images/herobg/pulau.webp?auto=format&fit=crop&w=600&q=80",
    alt: "Lempuyang Temple Gate",
  },
  {
    src: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80",
    alt: "Balinese Dance Culture",
  },
  {
    src: "/images/pulaukomodo.jpeg?auto=format&fit=crop&w=600&q=80",
    alt: "Sunset Tanah Lot",
  },
];

// Komponen Fitur (Helper)
const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <div className="relative group overflow-hidden bg-[#F57C00] p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:-rotate-1 hover:shadow-xl hover:shadow-orange-500/40">
    <div className="absolute inset-0 opacity-10" 
         style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
    </div>
    <div className="absolute -bottom-4 -right-4 text-white opacity-10 transition-all duration-500">
      <Icon size={100} strokeWidth={1.5} />
    </div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-600/20 transition-transform duration-300">
        <Icon size={24} className="text-[#F57C00]" strokeWidth={2.5} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-orange-50 text-sm font-medium leading-relaxed opacity-90">
        {description}
      </p>
      <div className="mt-auto pt-4">
         <div className="w-8 h-1 bg-white/40 rounded-full group-hover:w-16 transition-all duration-300" />
      </div>
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
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />

      <div className="relative z-20 -mt-8 px-4 mb-8">
         <div className="max-w-7xl mx-auto"> 
            <CategoryFilter 
              selectedSlug={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
         </div>
      </div>

      <DestinationGridSection
        endpoint={destinationEndpoint}
        title={sectionTitle}
        limit={4}
      />

      {/* Fitur Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Kenapa Pilih TiketLoka?
            </h2>
            <p className="text-gray-600 text-base">
              Solusi perjalanan terbaik untuk liburan impian Anda
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard icon={TrendingUp} title="Harga Terbaik" description="Promo menarik setiap hari untuk liburan hemat Anda." />
            <FeatureCard icon={Calendar} title="Booking Mudah" description="Pesan tiket cepat, konfirmasi instan ke email." />
            <FeatureCard icon={Shield} title="Aman Terpercaya" description="Transaksi aman dengan sistem enkripsi terkini." />
            <FeatureCard icon={Headphones} title="Layanan 24/7" description="Bantuan pelanggan siap sedia kapanpun Anda butuh." />
          </div>
        </div>
      </div>

      {/* --- CTA Section (UPDATED ANIMATED GRID) --- */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto bg-[#0B2F5E] rounded-3xl overflow-hidden relative shadow-2xl">
          {/* Background Element (Optional) */}
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-center justify-between p-10 lg:p-14 gap-12">
            
            {/* Bagian Kiri: Text */}
            <div className="lg:w-5/12 text-left z-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                  Liburan Impian
                  <br />
                  Mulai dari Sini
                </h2>
                <p className="text-gray-200 text-lg mb-8 leading-relaxed">
                  Jelajahi keindahan Indonesia dengan penawaran eksklusif. 
                  Abadikan momen tak terlupakan di destinasi terbaik.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/events">
                  <button className="bg-[#F57C00] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#E65100] hover:scale-105 transition-all flex items-center gap-2">
                    Pesan Tiket
                  </button>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Bagian Kanan: Animated Image Grid (2x3) */}
            <div className="lg:w-7/12 w-full relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={index}
                    // Animasi awal (transparan & agak turun)
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    // Animasi saat di-scroll (muncul & naik)
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    // Durasi & Delay (muncul satu per satu)
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1, // Stagger effect
                      type: "spring",
                      stiffness: 100 
                    }}
                    viewport={{ once: true, margin: "-50px" }} // Animasi jalan sekali saja
                    className="relative group overflow-hidden rounded-xl h-40 md:h-48 shadow-lg border-2 border-white/10"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-700"
                    />
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