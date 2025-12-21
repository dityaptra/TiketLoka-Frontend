'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie'; // ✅ Menggunakan library yang sudah Anda punya

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Memverifikasi login...');

  useEffect(() => {
    // Backend mengirim token via query params: ?token=...
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      setStatus('Login berhasil!.');
      
      // 1. Simpan Token ke Cookie (Versi js-cookie)
      // expires: 7 artinya 7 hari
      Cookies.set('token', token, { expires: 7 }); 
      
      // 2. Simpan ke LocalStorage (Cadangan)
      localStorage.setItem('token', token);

      window.location.href = '/';
    } 
    else if (error) {
      setStatus('Login Gagal: ' + error);
    } 
    else {
      setStatus('URL tidak valid. Token tidak ditemukan.');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg border border-gray-100">
        <div className="mb-4 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Memproses Masuk...</h2>
        <p className="text-gray-500">{status}</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}