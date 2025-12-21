'use client';

import { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import {
  Trash2, Calendar, Loader2, ShoppingCart, ArrowLeft,
  Ticket, CheckSquare, Square, Wallet, ShieldCheck,
  ScanLine, Building2, PlusCircle
} from 'lucide-react';
import { CartItem } from '@/types';
import { useRouter } from 'next/navigation';
import { useCartContext } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function CartPage() {
  const router = useRouter();
  const { refreshCart } = useCartContext();
  const { addNotification } = useNotification();

  const [carts, setCarts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca'>('qris');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  /* =======================
     Helpers
  ======================= */
  const formatIDR = (value: any) => {
    const price = Number(value);
    if (isNaN(price)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getItemAddons = (item: CartItem) => {
    let ids: number[] = [];
    try {
      ids = Array.isArray(item.addons)
        ? item.addons
        : JSON.parse(item.addons ?? '[]');
    } catch {
      ids = [];
    }

    return (item.destination.addons || []).filter((a: any) =>
      ids.map(String).includes(String(a.id))
    );
  };

  const getImageUrl = (url: string | null) => {
    if (!url)
      return 'https://images.unsplash.com/photo-1596423348633-8472df3b006c';
    if (url.startsWith('http')) return url;
    const clean = url.startsWith('/') ? url.slice(1) : url;
    return `${BASE_URL}/${clean.startsWith('storage') ? clean : `storage/${clean}`}`;
  };

  /* =======================
     Fetch Cart (SANCTUM)
  ======================= */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/cart`, {
          credentials: 'include', // 🔥 WAJIB
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        const json = await res.json();
        setCarts(json.data || []);
      } catch {
        toast.error('Gagal memuat keranjang');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [BASE_URL, router]);

  /* =======================
     Kalkulasi Total
  ======================= */
  const { totalQty, subTotalBase, totalAddons, grandTotal } = useMemo(() => {
    const selectedItems = carts.filter(i => selectedIds.includes(i.id));

    let qty = 0;
    let base = 0;
    let addons = 0;

    selectedItems.forEach(item => {
      const q = Number(item.quantity) || 0;
      qty += q;
      base += Number(item.destination.price) * q;

      const addonTotal = getItemAddons(item)
        .reduce((s, a) => s + Number(a.price), 0);

      addons += addonTotal * q;
    });

    return {
      totalQty: qty,
      subTotalBase: base,
      totalAddons: addons,
      grandTotal: base + addons,
    };
  }, [carts, selectedIds]);

  /* =======================
     Actions
  ======================= */
  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === carts.length ? [] : carts.map(i => i.id)
    );
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: 'Hapus item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
    });

    if (!confirm.isConfirmed) return;

    await fetch(`${BASE_URL}/api/cart/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    setCarts(prev => prev.filter(i => i.id !== id));
    setSelectedIds(prev => prev.filter(x => x !== id));
    refreshCart();
  };

  const handleClearCart = async () => {
    const confirm = await Swal.fire({
      title: 'Kosongkan keranjang?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya',
    });

    if (!confirm.isConfirmed) return;

    await fetch(`${BASE_URL}/api/cart`, {
      method: 'DELETE',
      credentials: 'include',
    });

    setCarts([]);
    setSelectedIds([]);
    refreshCart();
  };

  const handleCheckout = async () => {
    if (selectedIds.length === 0)
      return toast.error('Pilih minimal 1 item');

    setIsCheckingOut(true);

    try {
      const res = await fetch(`${BASE_URL}/api/checkout`, {
        method: 'POST',
        credentials: 'include', // 🔥 KRUSIAL
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_ids: selectedIds,
          payment_method: paymentMethod,
        }),
      });

      if (res.status === 401) {
        toast.error('Sesi login berakhir');
        router.push('/login');
        return;
      }

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || 'Checkout gagal');
        return;
      }

      addNotification(
        'transaction',
        'Menunggu Pembayaran',
        `Pesanan ${json.booking_code} dibuat`
      );

      toast.success('Checkout berhasil');
      refreshCart();
      router.push(`/payment/${json.booking_code}`);
    } catch {
      toast.error('Kesalahan koneksi');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#F57C00]" />
      </div>
    );

  /* =======================
     UI
  ======================= */
  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-40">
      <Navbar />

      <div className="max-w-6xl mx-auto pt-24 px-4">
        <Link href="/" className="text-sm text-gray-500 flex items-center gap-1">
          <ArrowLeft size={14} /> Kembali
        </Link>

        <h1 className="text-3xl font-bold mt-6 flex items-center gap-2">
          <ShoppingCart /> Keranjang
        </h1>

        {carts.length === 0 ? (
          <p className="mt-16 text-center text-gray-500">Keranjang kosong</p>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 mt-8">
            {/* LIST */}
            <div className="flex-1 space-y-4">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={toggleSelectAll}
              >
                {selectedIds.length === carts.length ? (
                  <CheckSquare />
                ) : (
                  <Square />
                )}
                Pilih Semua
              </div>

              {carts.map(item => {
                const addons = getItemAddons(item);
                const addonTotal = addons.reduce(
                  (s, a) => s + Number(a.price),
                  0
                );

                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-xl border flex gap-4"
                  >
                    <div onClick={() => toggleSelect(item.id)}>
                      {selectedIds.includes(item.id) ? (
                        <CheckSquare />
                      ) : (
                        <Square />
                      )}
                    </div>

                    <img
                      src={getImageUrl(item.destination.image_url)}
                      className="w-24 h-24 object-cover rounded"
                    />

                    <div className="flex-1">
                      <h3 className="font-bold">
                        {item.destination.name}
                      </h3>

                      <p className="text-xs text-gray-500">
                        {item.visit_date}
                      </p>

                      {addons.map((a: any) => (
                        <p
                          key={a.id}
                          className="text-xs text-green-600"
                        >
                          + {a.name}
                        </p>
                      ))}

                      <p className="font-bold text-[#F57C00] mt-2">
                        {formatIDR(
                          (Number(item.destination.price) + addonTotal) *
                            item.quantity
                        )}
                      </p>
                    </div>

                    <button onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* SUMMARY */}
            <div className="lg:w-96 bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold mb-4">Ringkasan</h3>

              <p>Total: {formatIDR(grandTotal)}</p>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="mt-6 w-full bg-[#0B2F5E] text-white py-3 rounded-xl"
              >
                {isCheckingOut ? 'Memproses...' : 'Bayar Sekarang'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}