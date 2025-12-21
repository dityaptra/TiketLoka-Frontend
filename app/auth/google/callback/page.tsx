"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login?error=google_failed");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const user = await res.json();

        // ✅ SIMPAN AUTH
        setAuth(token, user);

        router.replace(user.role === "admin" ? "/admin/dashboard" : "/");
      } catch {
        router.replace("/login?error=google_failed");
      }
    };

    fetchUser();
  }, [router, searchParams, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
    </div>
  );
}
