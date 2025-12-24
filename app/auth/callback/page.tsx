"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { createSession } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const [status, setStatus] = useState("Memproses login dengan Google...");

  // Ambil URL Backend dari env
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Ambil 'code' yang dikirim Google dari URL
      const code = searchParams.get("code");

      if (!code) {
        setStatus("Gagal: Tidak ada kode otentikasi ditemukan.");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      try {
        // 2. Kirim 'code' ke Laravel untuk ditukar jadi Token & User Data
        const res = await fetch(`${BASE_URL}/api/auth/google/callback?code=${code}`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Gagal memproses login Google.");
        }

        // 3. Sukses! Simpan Session (Cookie HTTPOnly) via Server Action
        await createSession(data.access_token, data.user.role);

        // 4. Update Context Client-Side
        login(data.access_token, data.user);

        addNotification(
          "system",
          "Login Berhasil",
          `Selamat datang, ${data.user.name}!`
        );

        // 5. Redirect ke Dashboard sesuai role
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }

      } catch (error: any) {
        console.error("Callback Error:", error);
        setStatus(`Error: ${error.message}`);
        // Jika gagal, kembalikan ke login setelah 3 detik
        setTimeout(() => router.push("/login?error=oauth_failed"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, login, addNotification, BASE_URL]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
      <Loader2 className="animate-spin text-[#F57C00] w-12 h-12 mb-4" />
      <h2 className="text-xl font-semibold text-gray-800">{status}</h2>
      <p className="text-gray-500 mt-2 text-sm">Mohon tunggu sebentar...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Auth...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}