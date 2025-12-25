"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Map, ShoppingBag, Tag, LogOut } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import { deleteSession } from "@/app/actions/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Kelola Wisata", href: "/admin/destinations", icon: Map },
    { name: "Kategori", href: "/admin/categories", icon: Tag },
    { name: "Transaksi", href: "/admin/bookings", icon: ShoppingBag },
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Keluar Aplikasi?",
      text: "Anda harus login kembali untuk mengakses halaman admin.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteSession();
        await logout();
        router.push("/");
        router.refresh(); 
      } catch (error) {
        console.error("Logout error:", error);
        await deleteSession();
        window.location.href = "/";
      }
    }
  };

  const getInitial = (name?: string | null): string => {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  };

  return (
    // UBAH: Background jadi Biru Gelap (#0B2F5E), Text jadi Putih/Terang
    <aside className="w-64 bg-[#0B2F5E] border-r border-blue-900/30 h-screen fixed top-0 left-0 flex flex-col z-30 shadow-lg">
      
      {/* 1. LOGO AREA */}
      <div className="h-16 flex items-center justify-center border-b border-blue-800/50 bg-[#09254A]">
        <div className="relative h-8 w-32">
          {/* Pastikan menggunakan logo versi Putih/Terang jika ada, atau logo ini masih terlihat jelas */}
          <Image
            src="/images/logonamaputih.png" // Saran: Gunakan logo putih (misal: logoputih.png) agar kontras
            alt="Logo TiketLoka"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* 2. MENU ITEMS */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon; 

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-white text-[#0B2F5E] shadow-md" // AKTIF: Background Putih, Teks Biru
                  : "text-blue-100 hover:bg-blue-800/50 hover:text-white" // NON-AKTIF: Teks Biru Muda, Hover agak terang
              }`}
            >
              <Icon
                size={20}
                className={
                  isActive
                    ? "text-[#F57C00]" // Icon Aktif jadi Oranye (aksen TiketLoka) agar cantik di atas putih
                    : "text-blue-300 group-hover:text-white" // Icon mati biru pudar
                }
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* 3. PROFIL ADMIN & LOGOUT */}
      <div className="p-4 border-t border-blue-800/50 bg-[#09254A]">
        {/* Profil Card Kecil */}
        <div className="flex items-center gap-3 mb-4 px-2">
          {/* Avatar */}
          <div className="w-10 h-10 bg-[#F57C00] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-[#0B2F5E] shrink-0">
            {getInitial(user?.name)}
          </div>
          
          {/* Info User */}
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate" title={user?.name || "Admin"}>
              {user?.name || "Admin"}
            </p>
            <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
              Administrator
            </p>
          </div>
        </div>

        {/* Tombol Logout MERAH SOLID */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-all shadow-sm cursor-pointer border border-red-500"
        >
          <LogOut size={16} />
          LOGOUT
        </button>
      </div>
    </aside>
  );
}