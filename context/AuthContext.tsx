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
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// KONFIGURASI URL API
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Token hanya disimpan di Memori (State), HILANG saat refresh.
  // Ini AMAN karena autentikasi utama sekarang dipegang oleh Cookie HttpOnly.
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cek LocalStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    // ❌ KITA HAPUS LOGIKA GET TOKEN DARI SINI
    // Kita hanya mengambil data User agar tampilan profil tetap ada
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data", e);
        localStorage.removeItem("user");
      }
    }
    
    // Pastikan tidak ada sisa token lama di LocalStorage pengguna
    localStorage.removeItem("token"); 
    
    setIsLoading(false);
  }, []);

  // Fungsi Login (Simpan data)
  const login = (newToken: string, userData: User) => {
    setToken(newToken); // Simpan di memori sementara
    setUser(userData);
    
    // Simpan data user saja (aman)
    localStorage.setItem("user", JSON.stringify(userData));

    // Redirect sesuai role
    // (Opsional: Bisa dihapus jika redirect sudah ditangani di page login)
    /* if (userData.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/");
    }
    */
  };

  // Fungsi Logout (Hapus data)
  const logout = async () => {
    const currentToken = token;

    // 1. BERSIHKAN CLIENT SIDE
    setToken(null);
    setUser(null);
    // Hapus data user dari storage
    localStorage.removeItem("user");
    // Pastikan token bersih (jaga-jaga)
    localStorage.removeItem("token");

    // 2. REDIRECT SEGERA (Optimistic UI)
    router.replace("/"); 
    router.refresh();

    // 3. PANGGIL API LOGOUT DI BACKGROUND
    // Karena token di localstorage sudah tidak ada, fetch ini mungkin perlu
    // cookie credentials agar backend tahu siapa yg logout.
    try {
      await fetch(`${BASE_URL}/api/logout`, {
        method: "POST",
        headers: {
          // Jika backend butuh Bearer dan kita punya di state, kirim.
          // Tapi jika refresh, token null. Backend harus bisa baca cookie.
          ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // PENTING: Kirim cookie HttpOnly ke backend Laravel
        credentials: "include", 
      });
    } catch (error) {
      console.warn("Server logout failed, but client session is cleared.");
    }
  };

  // Fungsi Update User
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
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