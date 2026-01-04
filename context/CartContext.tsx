'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { CartItem } from '@/types'; 

/* Jika file '@/types' belum ada, hapus import di atas dan uncomment kode ini:
   
   export interface CartItem {
       id: number;
       quantity: number;
       destination: {
           name: string;
           price: number;
           image_url: string;
           addons?: any[];
       };
       addons?: any;
       visit_date?: string;
   }
*/

interface CartContextType {
    cartCount: number;
    cartItems: CartItem[]; // PERBAIKAN: Ganti any[] dengan CartItem[]
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
    cartCount: 0,
    cartItems: [],
    refreshCart: async () => {},
});

// PERBAIKAN: Pindahkan BASE_URL keluar komponen agar stabil (tidak memicu re-render)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const CartProvider = ({ children }: { children: ReactNode }) => {
    // PERBAIKAN: Gunakan tipe data spesifik (hilangkan any)
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const { token } = useAuth();

    // 1. LOAD FROM LOCALSTORAGE (Hanya sekali saat mount)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('tiketloka_cart_data');
            if (savedCart) {
                try {
                    const parsedData = JSON.parse(savedCart);
                    if (Array.isArray(parsedData)) {
                        setCartItems(parsedData);
                    }
                } catch (e) {
                    console.error("Data storage rusak", e);
                }
            }
        }
    }, []); // Dependency kosong = aman, hanya jalan sekali

    // 2. FUNGSI SYNC KE SERVER
    const refreshCart = useCallback(async () => {
        if (!token) {
            setCartItems([]);
            if (typeof window !== 'undefined') localStorage.removeItem('tiketloka_cart_data');
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/cart`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const json = await res.json();
                
                if (res.ok && json.data) {
                    setCartItems(json.data);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('tiketloka_cart_data', JSON.stringify(json.data));
                    }
                }
            } else {
                console.warn("Server mengembalikan HTML, menggunakan data cache browser.");
            }
        } catch (error) {
            console.error("Gagal memuat keranjang (Network Error)", error);
        }
    }, [token]); // PERBAIKAN: BASE_URL sudah di luar, jadi dependensi aman

    // 3. AUTO REFRESH SAAT TOKEN BERUBAH
    useEffect(() => {
        if (token) {
            refreshCart();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); 
    // PERBAIKAN: Hapus 'refreshCart' dari dependency array dan matikan linter warning
    // Ini mencegah infinite loop "Cascading Updates"

    const cartCount = cartItems.length;

    return (
        <CartContext.Provider value={{ cartCount, cartItems, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = () => useContext(CartContext);