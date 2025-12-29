import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa6";
import { MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B2F5E] border-t border-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* GRID UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* KOLOM 1: Brand & Sosmed (DIPERBAIKI) */}
          {/* Tambahkan 'flex flex-col h-full' agar kolom ini mengisi tinggi penuh */}
          <div className="flex flex-col h-full">
            
            {/* Bagian Logo - Ukuran disesuaikan agar sejajar dengan Judul kolom lain */}
            {/* Ubah h-14 menjadi h-10 agar tidak terlalu mendorong teks ke bawah */}
            {/* Ubah mb-4 menjadi mb-6 agar jaraknya sama dengan judul kolom lain */}
            <div className="relative h-10 w-48 mb-6">
              <Image
                src="/images/logonamaputih.png"
                alt="TiketLoka Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            
            <p className="text-white text-sm leading-relaxed mb-6">
              Platform pemesanan tiket wisata termudah dan terpercaya. Temukan
              destinasi impianmu bersama TiketLoka.
            </p>

            {/* 'mt-auto' akan mendorong icon sosmed ke paling bawah container */}
            {/* Ini membuat tampilannya seimbang dengan kolom Hubungi Kami yang panjang */}
            <div className="mt-auto flex gap-3">
              <SocialLink href="#" icon={<FaInstagram size={18} />} />
              <SocialLink href="#" icon={<FaFacebookF size={16} />} />
              <SocialLink href="#" icon={<FaYoutube size={18} />} />
            </div>
          </div>

          {/* KOLOM 2: Perusahaan */}
          <div className="flex flex-col h-full">
            <h3 className="text-white font-bold text-lg mb-6">Perusahaan</h3>
            <ul className="space-y-3 text-sm text-white">
              <FooterLink href="/about" text="Tentang Kami" />
              <FooterLink href="/blog" text="Blog Travel" />
              <FooterLink href="/partner" text="Daftar Jadi Partner" />
            </ul>
          </div>

          {/* KOLOM 3: Dukungan */}
          <div className="flex flex-col h-full">
            <h3 className="text-white font-bold text-lg mb-6">Dukungan</h3>
            <ul className="space-y-3 text-sm text-white">
              <FooterLink href="/help" text="Pusat Bantuan" />
              <FooterLink href="/how-to-book" text="Cara Pemesanan" />
              <FooterLink href="/help" text="Pertanyaan Umum (FAQ)" />
            </ul>
          </div>

          {/* KOLOM 4: Kontak */}
          <div className="flex flex-col h-full"> 
            <h3 className="text-white font-bold text-lg mb-6">
              Hubungi Kami
            </h3>
            <ul className="space-y-4 text-sm text-white">
              <li className="flex items-start gap-3 group">
                <div className="p-1.5 bg-[#F57C00] rounded-full shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-white"/>
                </div>
                <span className="leading-relaxed">
                  Jl. Udayana No.11, Kab. Buleleng, Bali, 81116
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="p-1.5 bg-[#F57C00] rounded-full shrink-0">
                    <Phone className="w-3.5 h-3.5 text-white"/>
                </div>
                <span>+62 81234567890</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="p-1.5 bg-[#F57C00] rounded-full shrink-0">
                    <Mail className="w-3.5 h-3.5 text-white"/>
                </div>
                <span>tiketloka25@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* --- BAGIAN BAWAH (Copyright) --- */}
        <div className="border-t border-white pt-8 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          <p className="text-white text-xs md:text-sm text-center md:text-left">
            &copy; 2025 - {currentYear} TiketLoka. All Rights Reserved.
          </p>

          <div className="flex gap-6 text-xs md:text-sm text-white">
            <Link href="/privacy" className="hover:text-[#F57C00] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#F57C00] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
// Komponen Kecil untuk Social Link
function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#F57C00] hover:text-white transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
    >
      {icon}
    </Link>
  );
}

// Komponen Kecil untuk Link Footer Biasa
function FooterLink({ href, text }: { href: string; text: string }) {
  return (
    <li>
      <Link 
        href={href} 
        className="hover:text-[#F57C00] hover:translate-x-1 transition-all duration-200 inline-block"
      >
        {text}
      </Link>
    </li>
  );
}