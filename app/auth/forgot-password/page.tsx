'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // Pesan sukses
  const [error, setError] = useState('');   // Pesan error
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');

    try {
      // PENTING: Tembak ke URL Hosting Anda
      const res = await fetch('https://www.tiketloka.web.id/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.email?.[0] || 'Gagal mengirim email.');
      }
      
      setStatus('Link reset password telah dikirim ke email Anda! Cek inbox Gmail.');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Lupa Password?</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Masukkan email Anda, kami akan mengirimkan link untuk mereset password.
        </p>

        {status && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{status}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
          >
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-gray-500 hover:text-blue-600">
              ← Kembali ke Login
            </Link>
        </div>
      </div>
    </div>
  );
}