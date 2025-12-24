'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Komponen Form Utama
function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Ambil data dari URL (dikirim oleh Laravel lewat email)
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validasi sederhana di frontend
    if (password !== passwordConfirmation) {
      setError('Konfirmasi password tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://www.tiketloka.web.id/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email: emailParam,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mereset password.');

      setStatus('Berhasil! Password Anda sudah diperbarui.');
      // Redirect ke login setelah 3 detik
      setTimeout(() => router.push('/auth/login'), 3000);
      
    } catch (err: any) {
      setError(err.message || 'Token tidak valid atau kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border">
        <h2 className="text-2xl font-bold text-center mb-6">Password Baru</h2>

        {status && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{status}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password Baru</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Ulangi Password</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
          >
            {loading ? 'Memproses...' : 'Simpan Password Baru'}
          </button>
        </form>
    </div>
  );
}

// Halaman Utama (Wajib pakai Suspense karena baca URL searchParams)
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="text-center">Memuat...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}