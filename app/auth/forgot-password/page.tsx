'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('https://www.tiketloka.web.id/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.email?.[0] || 'Gagal mengirim email.');
      }
      
      setIsSuccess(true);
      
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans relative overflow-hidden">
      
      {/* --- BACKGROUND SHAPES --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[90vh] bg-blue-400 rounded-full mix-blend-multiply filter blur-[140px] opacity-60"></div>
        <div className="absolute top-[0%] right-[-15%] w-[70vw] h-[80vh] bg-orange-300 rounded-full mix-blend-multiply filter blur-[140px] opacity-60"></div>
      </div>
      
      {/* Pattern Overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative z-10">
        
        {/* --- TAMPILAN 1: FORM INPUT (Default) --- */}
        {!isSuccess ? (
            <>
                {/* Header Icon */}
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#0B2F5E]">
                    <KeyRound size={32} />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-extrabold text-[#0B2F5E] mb-2">Lupa Kata Sandi?</h1>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Jangan khawatir. Masukkan email yang terdaftar dan kami akan mengirimkan instruksi untuk mereset kata sandi Anda.
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Alamat Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F57C00]/20 focus:border-[#F57C00] transition-all text-gray-800 font-medium placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#F57C00] hover:bg-[#E65200] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" /> Mengirim...
                            </>
                        ) : (
                            'Kirim Link Reset'
                        )}
                    </button>
                </form>
            </>
        ) : (
            /* --- TAMPILAN 2: SUKSES TERKIRIM --- */
            <div className="text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-[#0B2F5E] mb-3">Cek Email Anda</h2>
                <p className="text-gray-600 mb-2">
                    Kami telah mengirimkan tautan reset password ke:
                </p>
                <p className="font-bold text-gray-800 bg-gray-50 py-2 px-4 rounded-lg inline-block mb-6 border border-gray-200">
                    {email}
                </p>
                <p className="text-sm text-gray-400 mb-8">
                    Jika tidak ada di kotak masuk, silakan periksa folder <strong>Spam</strong> atau <strong>Promosi</strong>.
                </p>
                
                <button 
                    onClick={() => { setIsSuccess(false); setEmail(''); }}
                    className="text-[#F57C00] font-bold text-sm hover:underline mb-6 block"
                >
                    Kirim ulang email?
                </button>
            </div>
        )}

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0B2F5E] transition-colors group"
            >
                <div className="p-1 rounded-full bg-gray-100 group-hover:bg-blue-50 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Kembali ke Halaman Login
            </Link>
        </div>

      </div>
    </div>
  );
}