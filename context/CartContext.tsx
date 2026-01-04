'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // FUNGSI BANTUAN: Ambil Cookie berdasarkan nama
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  useEffect(() => {
    // 1. Coba ambil token dari Cookie 'session_token'
    const storedToken = getCookie('session_token');
    
    // 2. Ambil data user dari localStorage (jika ada)
    // Kita asumsikan saat login kemarin Anda mungkin belum simpan user ke storage,
    // tapi minimal token harus ada agar tidak ditendang.
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('tiketloka_user_data') : null;

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Gagal parse user data", e);
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    
    // Simpan data user ke localStorage agar persist
    localStorage.setItem('tiketloka_user_data', JSON.stringify(newUser));
    
    // Cookie token sudah diset di halaman Login, jadi tidak perlu set di sini lagi
    // (Kecuali Anda ingin double check)
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    
    // Hapus semua jejak
    localStorage.removeItem('tiketloka_user_data');
    localStorage.removeItem('tiketloka_cart_data'); // Hapus keranjang juga biar bersih
    
    // Hapus Cookie Manual
    document.cookie = "session_token=; path=/; max-age=0; secure; samesite=lax";
    document.cookie = "user_role=; path=/; max-age=0; secure; samesite=lax";

    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};