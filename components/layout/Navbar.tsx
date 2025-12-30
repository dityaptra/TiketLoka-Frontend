"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCartContext } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { deleteSession } from "@/app/actions/auth";

import {
  LogOut,
  User,
  ShoppingCart,
  Ticket,
  Bell,
  CircleHelp,
  ChevronDown,
  Settings,
  Home,
  LucideIcon,
  Menu, // Icon Menu Hamburger
  X,    // Icon Close
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const getAvatarUrl = (url: string | undefined) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return `${BASE_URL}/storage/${cleanPath}`;
};

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { cartCount } = useCartContext();
  const { unreadCount } = useNotification();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false); // State untuk Menu HP
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [hasToken, setHasToken] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Cek Token
  useEffect(() => {
    const token = Cookies.get('token');
    if (token || user) {
      setHasToken(true);
    }
  }, [user]);

  // Tutup menu mobile saat pindah halaman
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false); // Tutup menu mobile juga

    const result = await Swal.fire({
      title: 'Yakin ingin keluar?',
      text: "Anda harus login kembali untuk mengakses tiket dan profil Anda.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setIsLoggingOut(true);
      try {
        await deleteSession();
        await logout();
        setHasToken(false);
        router.push('/');
        router.refresh();
      } catch (error) {
        console.error("Logout error:", error);
        setIsLoggingOut(false);
        await deleteSession();
        window.location.href = '/';
      }
    }
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push("/cart");
    }
  };

  const handleTicketsClick = () => {
    router.push("/tickets");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const baseNavStyle = "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 group";

  const getNavStyle = (path: string) => {
    const isActive = pathname === path;
    return `${baseNavStyle} ${
      isActive
        ? "bg-blue-50 text-[#0B2F5E] font-bold"
        : "text-gray-600 hover:bg-blue-50 hover:text-[#0B2F5E]"
    }`;
  };

  const profileMenuItems: MenuItem[] = [
    { label: "Pengaturan", icon: Settings, href: "/settings" },
  ];

  const isAuthenticated = !!user;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          
          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center gap-2 group z-50">
            {/* Ukuran logo responsif: w-32 di HP, w-40 di Laptop */}
            <div className="relative ml-10 h-10 w-32 md:h-12 md:w-40 transition-transform">
              <Image
                src="/images/navbar.png"
                alt="TiketLoka Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* --- DESKTOP MENU (Hidden di HP) --- */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/" className={getNavStyle("/")}>
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Beranda</span>
            </Link>

            <Link href="/help" className={getNavStyle("/help")}>
              <CircleHelp className="w-5 h-5" />
              <span className="text-sm font-medium">Bantuan</span>
            </Link>

            <button onClick={handleCartClick} className={`${getNavStyle("/cart")} relative cursor-pointer`}>
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">Keranjang</span>
            </button>

            {isAuthenticated && (
              <>
                <button onClick={handleTicketsClick} className={getNavStyle("/tickets")}>
                  <Ticket className="w-5 h-5" />
                  <span className="text-sm font-medium">Tiket Saya</span>
                </button>

                <Link href="/notifications" className={getNavStyle("/notifications")}>
                  <div className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">Notifikasi</span>
                </Link>
              </>
            )}

            {/* Profile Dropdown Desktop */}
            {isAuthenticated ? (
              <div className="relative ml-2 pl-2 border-l border-blue-200" ref={menuRef}>
                <button
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-blue-50 transition-colors"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-50 overflow-hidden border border-blue-200 relative">
                    {user?.avatar_url ? (
                      <Image
                        src={getAvatarUrl(user.avatar_url) || ""}
                        alt={user.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <User size={20} className="text-blue-500" />
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform duration-300 ${
                      isProfileMenuOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {/* Dropdown Content */}
                <div className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-50 ${isProfileMenuOpen ? "block" : "hidden"}`}>
                  <div className="px-5 py-3 border-b border-gray-100 mb-2">
                    <p className="font-bold text-[#0B2F5E] truncate text-base">
                      {user?.name || "Pengguna"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">Member TiketLoka</p>
                  </div>
                  {profileMenuItems.map((item, index) => (
                    <Link href={item.href} key={index} className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0B2F5E] flex items-center gap-3 transition-colors">
                      <item.icon className="w-4 h-4" /> <span>{item.label}</span>
                    </Link>
                  ))}
                  <div className="my-2 border-t border-gray-100"></div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? "Keluar..." : "Log Out"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-300">
                <Link href="/login">
                  <button className="px-5 py-2 text-sm text-[#0B2F5E] font-bold border border-[#0B2F5E] rounded-lg hover:bg-blue-50 transition-colors">Masuk</button>
                </Link>
                <Link href="/register">
                  <button className="px-5 py-2 text-sm bg-[#F57C00] text-white font-bold rounded-lg hover:bg-[#E65100] transition-colors">Daftar</button>
                </Link>
              </div>
            )}
          </div>

          {/* --- MOBILE ACTIONS (Visible di HP) --- */}
          <div className="flex lg:hidden items-center gap-3">
             {/* Icon Cart & Notif tetap muncul di Navbar HP agar mudah diakses */}
             <button onClick={handleCartClick} className="relative p-2 text-gray-600">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
             </button>

             {isAuthenticated && (
               <Link href="/notifications" className="relative p-2 text-gray-600">
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
               </Link>
             )}

             {/* Hamburger Menu Toggle */}
             <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
             >
                {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
             </button>
          </div>

        </div>

        {/* --- MOBILE MENU DROPDOWN --- */}
        {/* Menu ini hanya muncul di HP saat tombol hamburger diklik */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-in slide-in-from-top-5 border-t border-gray-100 pt-4">
            
            {/* Jika User Login: Tampilkan Info Profil Singkat */}
            {isAuthenticated && (
                <div className="flex items-center gap-3 px-3 mb-6 bg-blue-50 p-4 rounded-xl">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 overflow-hidden border border-blue-200 relative">
                      {user?.avatar_url ? (
                        <Image src={getAvatarUrl(user.avatar_url) || ""} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <User size={24} />
                      )}
                   </div>
                   <div className="overflow-hidden">
                      <p className="font-bold text-[#0B2F5E] truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                   </div>
                </div>
            )}

            <div className="flex flex-col gap-2">
              <Link href="/" className="px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 font-medium text-gray-700">
                <Home className="w-5 h-5 text-blue-600" /> Beranda
              </Link>
              
              {isAuthenticated && (
                <button onClick={handleTicketsClick} className="px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 font-medium text-gray-700 w-full text-left">
                  <Ticket className="w-5 h-5 text-orange-500" /> Tiket Saya
                </button>
              )}

              <Link href="/help" className="px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 font-medium text-gray-700">
                <CircleHelp className="w-5 h-5 text-green-600" /> Bantuan
              </Link>

              {isAuthenticated ? (
                <>
                   <Link href="/settings" className="px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 font-medium text-gray-700">
                      <Settings className="w-5 h-5 text-gray-500" /> Pengaturan
                   </Link>
                   <button 
                      onClick={handleLogout}
                      className="px-4 py-3 hover:bg-red-50 rounded-lg flex items-center gap-3 font-medium text-red-600 w-full text-left mt-2 border-t border-gray-100 pt-4"
                   >
                      <LogOut className="w-5 h-5" /> Keluar
                   </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-4 px-2">
                   <Link href="/login">
                      <button className="w-full py-3 text-center border border-[#0B2F5E] text-[#0B2F5E] font-bold rounded-lg">Masuk</button>
                   </Link>
                   <Link href="/register">
                      <button className="w-full py-3 text-center bg-[#F57C00] text-white font-bold rounded-lg shadow-md hover:bg-[#E65100]">Daftar</button>
                   </Link>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;