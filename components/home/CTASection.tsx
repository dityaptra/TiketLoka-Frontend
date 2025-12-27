"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { galleryImages } from "@/data/HomeData"; // Import data dari Langkah 1

export default function CTASection() {
  return (
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
              <h2 className="text-4xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
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
                  className="relative group overflow-hidden rounded-2xl h-32 sm:h-40 md:h-48 shadow-lg border-2 border-white/10"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700"
                  />
                  <div className="absolute inset-0 duration-500"></div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}