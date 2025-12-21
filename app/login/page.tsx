"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 Jika sudah login → redirect
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === "admin" ? "/admin/dashboard" : "/");
    }
  }, [user, isLoading, router]);

  // 🔑 LOGIN MANUAL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login gagal");

      // ⬇️ SIMPAN AUTH VIA CONTEXT
      setAuth(data.access_token, data.user);

      router.replace(data.user.role === "admin" ? "/admin/dashboard" : "/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔵 LOGIN GOOGLE
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md p-6 shadow-lg rounded-xl">
        <div className="text-center mb-6">
          <Image
            src="/images/tiketlokaputih.png"
            alt="TiketLoka"
            width={160}
            height={60}
            className="mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold">Masuk</h2>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-xs text-gray-500">atau</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border py-2 rounded-lg hover:bg-gray-50"
        >
          Masuk dengan Google
        </button>

        <p className="text-center text-sm mt-4 text-gray-500">
          Belum punya akun?{" "}
          <Link href="/register" className="text-orange-500 font-semibold">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
