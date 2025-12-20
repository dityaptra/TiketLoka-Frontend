'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// --- BAGIAN 1: LOGIC UTAMA (CONTENT) ---
function FacebookCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Memproses login Facebook...");
  
  // Flag agar tidak double process
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (hasProcessed) return; // Stop jika sudah diproses

    const processCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus("Gagal: Akses ditolak oleh user.");
        setHasProcessed(true);
        return;
      }

      if (code) {
        try {
          // Logic panggil API Backend Anda disini
          console.log("Code Facebook:", code);
          
          // Contoh fetch ke backend:
          // const response = await fetch('/api/auth/facebook', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ code })
          // });
          // const data = await response.json();
          
          setStatus("Login berhasil! Mengalihkan...");
          setHasProcessed(true);
          
          // Redirect setelah sukses
          // setTimeout(() => router.push('/dashboard'), 2000);
          
        } catch (err) {
          setStatus("Gagal: Terjadi kesalahan saat memproses login.");
          setHasProcessed(true);
        }
      } else {
        // Handle jika URL tidak ada code
        setStatus("Gagal: Kode tidak ditemukan.");
        setHasProcessed(true);
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    processCallback();
  }, [searchParams, router, hasProcessed]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Login Facebook</h2>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}

// --- BAGIAN 2: WRAPPER SUSPENSE (WAJIB UNTUK VERCEL) ---
export default function FacebookCallbackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <FacebookCallbackContent />
    </Suspense>
  );
}