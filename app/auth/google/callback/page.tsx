'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();
  const [status, setStatus] = useState('Memverifikasi login...');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    // ❌ Jika ada error dari backend
    if (error) {
      setStatus('Login Gagal: ' + error);
      setTimeout(() => {
        router.replace('/login?error=google_failed');
      }, 2000);
      return;
    }

    // ❌ Jika token tidak ada
    if (!token) {
      setStatus('URL tidak valid. Token tidak ditemukan.');
      setTimeout(() => {
        router.replace('/login?error=google_failed');
      }, 2000);
      return;
    }

    // ✅ Fetch data user dari backend
    const fetchUser = async () => {
      try {
        setStatus('Memverifikasi akun Anda...');

        const res = await fetch(`${API_URL}/api/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Unauthorized');
        }

        const user = await res.json();

        setStatus('Login berhasil! Mengalihkan...');

        // 💾 Simpan ke Cookie (7 hari)
        Cookies.set('token', token, { expires: 7 });

        // 💾 Simpan ke LocalStorage (Cadangan)
        localStorage.setItem('token', token);

        // 💾 Simpan ke Auth Context
        setAuth(token, user);

        // 🔀 Role-based redirect
        setTimeout(() => {
          const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : '/';
          window.location.href = redirectUrl;
        }, 500);

      } catch (err) {
        console.error('Fetch user error:', err);
        setStatus('Gagal memverifikasi akun. Mengalihkan ke login...');
        
        setTimeout(() => {
          router.replace('/login?error=google_failed');
        }, 2000);
      }
    };

    fetchUser();
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg border border-gray-100">
        <div className="mb-4 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Memproses Masuk...</h2>
        <p className="text-gray-500">{status}</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}