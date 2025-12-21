"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";

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
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔐 INIT AUTH (ONCE)
  useEffect(() => {
    const initAuth = async () => {
      const cookieToken = Cookies.get("token");

      if (!cookieToken) {
        setIsLoading(false);
        return;
      }

      setToken(cookieToken);

      try {
        const res = await fetch(`${BASE_URL}/api/user`, {
          headers: {
            Authorization: `Bearer ${cookieToken}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const userData = await res.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ✅ Dipanggil oleh login / callback page
  const setAuth = (newToken: string, userData: User) => {
    Cookies.set("token", newToken, {
      expires: 7,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    setToken(newToken);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    Cookies.remove("token", { path: "/" });
    localStorage.removeItem("user");
  };

  // 🔄 Optional refresh (dipakai profile update)
  const refreshUser = async () => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error();

      const userData = await res.json();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, setAuth, clearAuth, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
