"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Import js-cookie
import api from "@/lib/axios";   // Import axios instance kita

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone_number: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // Token dummy state
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load User saat refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    // Cek juga apakah cookie token masih ada (opsional, via js-cookie tak bisa baca httponly)
    // Tapi kita bisa cek 'user_role' sebagai indikator sesi aktif
    const roleCookie = Cookies.get('user_role');

    if (storedUser && roleCookie) {
      try {
        setUser(JSON.parse(storedUser));
        setToken("session_active"); // Restore dummy token biar UI gak logout
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // FUNGSI LOGIN
  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // Cookie 'user_role' sudah diset di halaman Login Page
  };

  // FUNGSI LOGOUT (REVISI PENTING)
  const logout = async () => {
    try {
      // 1. Request Logout ke Backend (Axios otomatis bawa cookie token)
      await api.post("/api/logout");
    } catch (error) {
      console.warn("Logout backend gagal/offline, tetap bersihkan client.");
    } finally {
      // 2. Bersihkan Client Side (Apapun yang terjadi)
      setToken(null);
      setUser(null);
      localStorage.removeItem("user");
      
      // 3. HAPUS COOKIE ROLE AGAR MIDDLEWARE MEMBLOKIR AKSES
      Cookies.remove('user_role'); 
      
      // 4. Redirect
      router.replace("/login");
      router.refresh();
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}