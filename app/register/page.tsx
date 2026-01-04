"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createSession, deleteSession } from "@/app/actions/auth";

// --- KOMPONEN ICON ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// --- BAGIAN 1: ISI KONTEN ---
function RegisterContent() {
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.phone_number.trim() !== "" &&
    formData.password.length >= 8 &&
    formData.password === formData.password_confirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Konfirmasi password tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // 1. CEK JSON (Anti Error HTML 500)
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
          // Jika backend error mengembalikan HTML, lempar error agar tidak crash
          throw new Error("Terjadi kesalahan server (500). Silakan coba lagi nanti.");
      }

      const data = await res.json();
      
      if (!res.ok)
        throw new Error(data.message || "Gagal melakukan pendaftaran");

      // 2. 🔥 PENTING: BUAT COOKIE MANUAL (AUTO LOGIN PERSISTEN)
      // Agar setelah register, user tidak logout saat refresh
      document.cookie = `session_token=${data.access_token}; path=/; max-age=86400; secure; samesite=lax`;
      
      const role = data.user.role || 'customer';
      document.cookie = `user_role=${role}; path=/; max-age=86400; secure; samesite=lax`;

      // 3. Update Session & Context
      await createSession(data.access_token, data.user.role);
      login(data.access_token, data.user);

      addNotification(
        "system",
        "Pendaftaran Berhasil",
        "Akun Anda telah aktif. Selamat bergabung!"
      );

      router.push('/');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      console.log('🔵 Initiating Google OAuth...');
      await deleteSession();
      const res = await fetch(`${BASE_URL}/api/auth/google/url`);
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Gagal mendapatkan URL Google Auth");
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError("Gagal terhubung ke Google Login.");
      setIsLoading(false);
    }
  };

  const inputWrapperClass = "relative flex items-center";
  const iconClass = "absolute left-3 text-gray-400 w-5 h-5";
  const inputClass =
    "w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-[#005eff] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-sm placeholder:text-gray-400";

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-white">
      
      {/* --- BACKGROUND SHAPES --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[90vh] bg-blue-400 rounded-full mix-blend-multiply filter blur-[140px] opacity-60"></div>
        <div className="absolute top-[0%] right-[-15%] w-[70vw] h-[80vh] bg-orange-300 rounded-full mix-blend-multiply filter blur-[140px] opacity-60"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-6 pt-10 relative z-10">
        <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[550px]">
          
          {/* Kolom Kiri: Ilustrasi & Branding */}
          <div className="hidden lg:flex flex-col justify-center items-center bg-[#005eff] relative overflow-hidden p-10 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#005eff] to-[#0046b0] opacity-100 z-0"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#002a6b] opacity-20 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="relative w-64 h-64 mb-6 animate-fade-in-up">
                <Image
                  src="/images/tiketlokaputih.png"
                  alt="Ilustrasi Register"
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Bergabunglah Bersama Kami
              </h2>
              <p className="text-blue-100 text-sm max-w-xs leading-relaxed">
                Dapatkan akses ke ribuan event dan destinasi menarik hanya dalam
                satu aplikasi.
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Form */}
          <div className="w-full p-6 md:p-10 flex flex-col justify-center">
            
            {/* --- TOMBOL KEMBALI (DI DALAM CARD) --- */}
            <div className="mb-1">
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#F57C00] transition-colors group"
                >
                    <div className="p-1 rounded-full bg-gray-100 group-hover:bg-orange-50 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Kembali
                </Link>
            </div>

            <div className="mb-3">
              <h3 className="text-2xl font-bold text-gray-800">
                Daftar Sekarang
              </h3>
              <div className="mt-2 text-left text-sm mb-2">
                <span className="text-gray-500">Sudah punya akun? </span>
                <Link
                  href="/login"
                  className="text-[#F57C00] font-semibold hover:text-[#d46a00] hover:underline transition-colors"
                >
                  Masuk
                </Link>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r flex items-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-gray-600">
              <div className={inputWrapperClass}>
                <User className={iconClass} />
                <input
                  name="name"
                  type="text"
                  placeholder="Nama Lengkap"
                  required
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className={inputWrapperClass}>
                <Phone className={iconClass} />
                <input
                  name="phone_number"
                  type="tel"
                  placeholder="Nomor Telepon"
                  required
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className={inputWrapperClass}>
                <Mail className={iconClass} />
                <input
                  name="email"
                  type="email"
                  placeholder="Alamat Email"
                  required
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className={inputWrapperClass}>
                <Lock className={iconClass} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (Min. 8 Karakter)"
                  required
                  onChange={handleChange}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className={inputWrapperClass}>
                <Lock className={iconClass} />
                <input
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi Password"
                  required
                  onChange={handleChange}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* --- TOMBOL DAFTAR --- */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full font-semibold py-3 rounded-lg transition-all transform flex items-center justify-center gap-2 mt-6 
                  ${
                    isFormValid && !isLoading
                      ? "bg-[#F57C00] hover:bg-[#E65100] text-white cursor-pointer"
                      : "bg-gray-300 border border-gray-300 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5 text-[#F57C00]" />
                ) : (
                  "DAFTAR"
                )}
              </button>
            </form>

            <div className="flex items-center justify-center my-4 w-full">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-4 text-xs font-medium text-gray-500 tracking-wider">
                atau
              </span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div className="mt">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center cursor-pointer gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-all text-sm"
              >
                <GoogleIcon /> <span>Daftar dengan Google</span>
              </button>
            </div>

            <div className="text-center text-[11px] md:text-xs text-gray-500 leading-relaxed px-2 pt-4 mt-1">
              Dengan mendaftar, Anda menyetujui{" "}
              <Link href="/privacy" className="underline text-[#F57C00]">
                Kebijakan Privasi
              </Link>{" "}
              dan{" "}
              <Link href="/terms" className="underline text-[#F57C00]">
                Syarat & Ketentuan
              </Link>{" "}
              TiketLoka.
            </div>
          </div>
        </div>
      </div>

      <footer className="w-full py-4 text-center text-xs text-gray-500 relative z-10">
        &copy; 2025 - {new Date().getFullYear()} TiketLoka. All Rights Reserved.
      </footer>
    </div>
  );
}

// --- BAGIAN 2: EXPORT UTAMA DENGAN SUSPENSE ---
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#F57C00] w-10 h-10" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}