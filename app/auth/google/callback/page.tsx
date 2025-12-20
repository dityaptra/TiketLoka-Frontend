'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, XCircle } from 'lucide-react';

// --- BAGIAN 1: LOGIC UTAMA (CONTENT) ---
function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState('Memproses login Google...');
  const [isError, setIsError] = useState(false);
  const [hasRun, setHasRun] = useState(false); // Mencegah run 2x (React Strict Mode)

  // KONFIGURASI URL API
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (hasRun) return; // Cegah running dua kali

    const processCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const errorMessage = searchParams.get('message');
      
      // Tandai sudah berjalan
      setHasRun(true);

      // 1. CEK DULU: Apakah ada error dari backend?
      if (error) {
        setIsError(true);
        
        const errorMessages: Record<string, string> = {
          'access_denied': 'Login dibatalkan. Silakan coba lagi.',
          'invalid_provider': 'Provider OAuth tidak valid.',
          'server_error': errorMessage || 'Terjadi kesalahan server.',
          'email_exists': 'Email sudah terdaftar dengan metode lain.'
        };
        
        setStatus(errorMessages[error] || 'Login gagal. Silakan coba lagi.');
        
        // Redirect ke login setelah 3 detik
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      // 2. Jika tidak ada error, proses token
      if (token) {
        try {
          const response = await fetch(`${BASE_URL}/api/user`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Token tidak valid');
          }

          const json = await response.json();
          
          // Handle response format (json.data atau json langsung)
          const userData = json.data || json;

          // Simpan ke Context & LocalStorage
          login(token, userData);
          
          setStatus('Login berhasil! Mengalihkan...');
          
          // Redirect berdasarkan role
          setTimeout(() => {
            if (userData.role === 'admin') {
              router.push('/admin/dashboard');
            } else {
              router.push('/');
            }
          }, 1000);

        } catch (err) {
          console.error(err);
          setIsError(true);
          setStatus('Gagal mengambil data user. Token tidak valid.');
          setTimeout(() => router.push('/login'), 3000);
        }
      } else {
        // Tidak ada token dan tidak ada error = URL tidak valid
        // Cek agar tidak error false positive saat render pertama yg kosong
        const currentUrl = window.location.href;
        if (currentUrl.includes('callback')) {
          setIsError(true);
          setStatus('URL tidak valid. Mengalihkan ke halaman login...');
          setTimeout(() => router.push('/login'), 2000);
        }
      }
    };

    processCallback();
  }, [searchParams, login, router, BASE_URL, hasRun]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      {isError ? (
        <XCircle className="w-16 h-16 text-red-500" />
      ) : (
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      )}
      <p className={`text-lg font-medium ${isError ? 'text-red-600' : 'text-gray-600'}`}>
        {status}
      </p>
    </div>
  );
}

// --- BAGIAN 2: WRAPPER SUSPENSE (WAJIB UNTUK VERCEL) ---
export const dynamic = "force-dynamic";

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}