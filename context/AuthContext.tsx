"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Tipe data User
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
  logout: () => void; // Kita ubah jadi void biasa karena logout frontend lebih instan
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- HELPER: Fungsi Membaca Cookie ---
// Ditaruh di luar komponen agar bersih
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // 1. LAZY INITIALIZATION UNTUK TOKEN (KUNCI AGAR TIDAK LOGOUT SAAT REFRESH)
  // Kode ini jalan SEBELUM render pertama, jadi state langsung terisi.
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      // Cari cookie manual yang kita buat di halaman Login
      return getCookie('session_token') || null;
    }
    return null;
  });

  // 2. LAZY INITIALIZATION UNTUK USER
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem("tiketloka_user_data");
      try {
        return storedUser ? JSON.parse(storedUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // useEffect hanya untuk mematikan status loading
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Fungsi Login
  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    
    // Simpan data user ke localStorage agar persist saat refresh
    localStorage.setItem("tiketloka_user_data", JSON.stringify(userData));
    
    // Catatan: Token tidak perlu disimpan ke localStorage/Cookie di sini
    // karena Halaman Login (Page.tsx) sudah melakukannya untuk kita.
  };

  // Fungsi Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    
    // 1. Bersihkan LocalStorage
    localStorage.removeItem("tiketloka_user_data");
    localStorage.removeItem("tiketloka_cart_data"); // Bersihkan keranjang juga

    // 2. HAPUS COOKIE MANUAL
    // Kita set expired date ke masa lalu agar browser menghapusnya
    document.cookie = "session_token=; path=/; max-age=0; secure; samesite=lax";
    document.cookie = "user_role=; path=/; max-age=0; secure; samesite=lax";

    // 3. Redirect ke Login
    router.push("/login");
    router.refresh();
  };

  // Fungsi Update User
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("tiketloka_user_data", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}