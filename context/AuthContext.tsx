"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // ✅ Pastikan import ini ada

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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 👇 LOGIKA BARU (Fetch Version)
  useEffect(() => {
    const initAuth = async () => {
      // 1. Cek Token: Prioritaskan Cookie (dari Google), lalu LocalStorage
      const cookieToken = Cookies.get("token");
      const localToken = localStorage.getItem("token");
      const validToken = cookieToken || localToken;

      if (validToken) {
        setToken(validToken);

        // Cek data user di LocalStorage (Cache Cepat)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("User data corrupt", e);
          }
        }

        // 2. FETCH DATA USER DARI SERVER (Wajib untuk memastikan Token Valid)
        try {
          const res = await fetch(`${BASE_URL}/api/user`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${validToken}`, // Manual pasang Header
              "Accept": "application/json",
            },
          });

          if (res.ok) {
            const freshUserData = await res.json();
            setUser(freshUserData);
            
            // Sinkronisasi Storage
            localStorage.setItem("user", JSON.stringify(freshUserData));
            if (!localToken) {
                localStorage.setItem("token", validToken);
            }
          } else {
            // Jika token expired (401), logout otomatis
            if (res.status === 401) {
                throw new Error("Token Expired");
            }
          }
        } catch (error) {
          console.error("Gagal validasi user:", error);
          // Jika gagal fetch user, anggap logout
          handleLogoutCleanup(); 
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Helper untuk membersihkan state (dipakai di logout & error)
  const handleLogoutCleanup = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Cookies.remove("token");
  };

  // Fungsi Login (Manual Form)
  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    
    // Simpan di kedua tempat
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    Cookies.set("token", newToken, { expires: 7 }); 

    if (userData.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/");
    }
  };

  // Fungsi Logout
  const logout = async () => {
    const currentToken = token; // Simpan token sebelum dihapus

    // 1. Bersihkan Client Dulu (Optimistic)
    handleLogoutCleanup();
    router.replace("/");
    router.refresh();

    // 2. Panggil API Logout (Background)
    try {
      if (currentToken) {
        await fetch(`${BASE_URL}/api/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${currentToken}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.warn("Logout server failed, but client is clear.");
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