'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';

// --- KOMPONEN FORM ---
function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Ambil token & email dari URL
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle lihat password
  const [showConfirm, setShowConfirm] = useState(false);   // Toggle lihat konfirmasi

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect otomatis jika sukses
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validasi Frontend
    if (password.length < 8) {
      setError('Password minimal harus 8 karakter.');
      setLoading(false);
      return;
    }

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
      
      if (!res.ok) {
        throw new Error(data.message || 'Gagal mereset password. Token mungkin kedaluwarsa.');
      }

      setIsSuccess(true); // Trigger tampilan sukses
      
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  // --- TAMPILAN SUKSES ---
  if (isSuccess) {
    return (
      <div className="text-center animate-in zoom-in duration-300 py-8">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#0B2F5E] mb-2">Password Berhasil Diubah!</h2>
        <p className="text-gray-600 mb-6">
          Anda sekarang dapat login menggunakan password baru.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Mengalihkan ke halaman login...
        </div>
      </div>
    );
  }

  // --- TAMPILAN FORM ---
  return (
    <>
        {/* Header Icon */}
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#F57C00]">
            <KeyRound size={32} />
        </div>

        <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[#0B2F5E] mb-2">Password Baru</h2>
            <p className="text-gray-500 text-sm">
                Silakan buat password baru yang aman untuk akun Anda.
            </p>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Password Baru */}
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Password Baru</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F57C00]/20 focus:border-[#F57C00] transition-all text-gray-800 font-medium placeholder:text-gray-400"
                        placeholder="Minimal 8 karakter"
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            {/* Input Konfirmasi Password */}
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Ulangi Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type={showConfirm ? "text" : "password"}
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className={`w-full pl-11 pr-11 py-3.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-800 font-medium placeholder:text-gray-400 ${
                            password && passwordConfirmation && password !== passwordConfirmation 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                            : 'border-gray-200 focus:border-[#F57C00] focus:ring-[#F57C00]/20'
                        }`}
                        placeholder="Masukkan ulang password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                    >
                        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {/* Helper Text jika password tidak cocok */}
                {password && passwordConfirmation && password !== passwordConfirmation && (
                    <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">Password tidak cocok.</p>
                )}
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#F57C00] hover:bg-[#E65200] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin w-5 h-5" /> Memproses...
                    </>
                ) : (
                    'Simpan Password Baru'
                )}
            </button>
        </form>
    </>
  );
}

// --- KOMPONEN UTAMA (PAGE) ---
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative z-10">
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-10 h-10 text-[#F57C00] animate-spin mb-4"/>
                <p className="text-gray-500 font-medium">Memuat formulir...</p>
            </div>
        }>
            <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}