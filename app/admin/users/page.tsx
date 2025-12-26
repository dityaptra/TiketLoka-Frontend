"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Trash2, UserPlus, Shield, Pencil, Lock, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone_number: string;
}

export default function ManageAdmins() {
  // Ambil token juga dari useAuth untuk Header Authorization
  const { user, token } = useAuth();
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // DEFINISI URL API (Sama seperti di kategori)
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // PROTEKSI HALAMAN (Double Check)
  if (user && user.role !== 'owner') {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center opacity-50">
            <Lock size={64} className="text-gray-400 mb-4"/>
            <h2 className="text-2xl font-bold text-gray-800">Akses Ditolak</h2>
            <p className="text-gray-500">Anda tidak memiliki izin untuk halaman ini.</p>
        </div>
      );
  }

  // 1. FETCH DATA (GANTI AXIOS -> FETCH)
  const fetchAdmins = async () => {
    if (!token) return; // Cegah fetch jika token belum load

    try {
      const res = await fetch(`${BASE_URL}/api/owner/admins`, {
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}` // Wajib pakai Bearer Token
        }
      });
      
      const json = await res.json();
      
      if (res.ok) {
        setAdmins(json.data || []);
      } else {
        console.error("Gagal load admin:", json.message);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Jalankan ulang saat token tersedia

  // 2. TAMBAH ADMIN (GANTI AXIOS -> FETCH)
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !phone) {
        Swal.fire("Error", "Semua kolom wajib diisi!", "error");
        return;
    }

    try {
      Swal.fire({ title: 'Menyimpan...', didOpen: () => Swal.showLoading() });

      const res = await fetch(`${BASE_URL}/api/owner/admins`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ name, email, password, phone_number: phone })
      });

      const json = await res.json();

      if (res.ok) {
          Swal.fire("Sukses", "Admin berhasil ditambahkan", "success");
          setName(""); setEmail(""); setPassword(""); setPhone("");
          fetchAdmins();
      } else {
          throw new Error(json.message || "Gagal menambahkan admin");
      }
    } catch (error: any) {
      Swal.fire("Gagal", error.message || "Terjadi kesalahan", "error");
    }
  };

  // 3. HAPUS ADMIN (GANTI AXIOS -> FETCH)
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Admin?", 
      text: "Akses login mereka akan hilang.",
      icon: "warning", 
      showCancelButton: true, 
      confirmButtonColor: "#d33", 
      confirmButtonText: "Hapus"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${BASE_URL}/api/owner/admins/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            Swal.fire("Terhapus", "Admin telah dihapus.", "success");
            fetchAdmins();
        } else {
            Swal.fire("Gagal", "Gagal menghapus admin", "error");
        }
      } catch (e) { 
        Swal.fire("Gagal", "Error koneksi", "error"); 
      }
    }
  };

  // 4. EDIT ADMIN (GANTI AXIOS -> FETCH)
  const handleEdit = async (admin: AdminUser) => {
    const { value: formValues } = await Swal.fire({
      title: `Edit ${admin.name}`,
      html: `
        <div class="text-left space-y-3">
            <input id="swal-name" class="swal2-input w-full m-0" placeholder="Nama" value="${admin.name}">
            <input id="swal-email" class="swal2-input w-full m-0" placeholder="Email" value="${admin.email}">
            <input id="swal-phone" class="swal2-input w-full m-0" placeholder="Telepon" value="${admin.phone_number}">
            <input id="swal-pass" type="password" class="swal2-input w-full m-0" placeholder="Password Baru (Opsional)">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#0B2F5E',
      confirmButtonText: 'Simpan',
      preConfirm: () => {
        return {
          name: (document.getElementById('swal-name') as HTMLInputElement).value,
          email: (document.getElementById('swal-email') as HTMLInputElement).value,
          phone_number: (document.getElementById('swal-phone') as HTMLInputElement).value,
          password: (document.getElementById('swal-pass') as HTMLInputElement).value
        }
      }
    });

    if (formValues) {
      try {
        Swal.fire({ title: 'Mengupdate...', didOpen: () => Swal.showLoading() });
        
        const res = await fetch(`${BASE_URL}/api/owner/admins/${admin.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(formValues)
        });

        const json = await res.json();

        if (res.ok) {
            Swal.fire("Sukses", "Data berhasil diperbarui", "success");
            fetchAdmins();
        } else {
            throw new Error(json.message || "Gagal update");
        }
      } catch (error: any) {
        Swal.fire("Gagal", error.message, "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0B2F5E]">Kelola Admin (Super Admin)</h1>

      {/* FORM CREATE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-[#F57C00]"/> Tambah Admin Baru
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama Lengkap" className="input-std" required/>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="input-std" required/>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="No. Telepon" className="input-std" required/>
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="input-std" required/>
            <button type="submit" className="md:col-span-2 bg-[#0B2F5E] text-white py-2 rounded-lg font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2">
                <Shield size={18}/> Simpan Admin
            </button>
        </form>
      </div>

      {/* TABLE LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="p-4 text-sm font-bold text-gray-600">Nama</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Email</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Telepon</th>
                    <th className="p-4 text-center text-sm font-bold text-gray-600">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {isLoading ? (
                    <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-800"/></td></tr>
                ) : admins.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-gray-400">Belum ada admin lain.</td></tr>
                ) : (
                    admins.map((adm) => (
                        <tr key={adm.id} className="hover:bg-blue-50 transition">
                            <td className="p-4 font-bold text-gray-700">{adm.name}</td>
                            <td className="p-4 text-gray-600 text-sm">{adm.email}</td>
                            <td className="p-4 text-gray-600 text-sm">{adm.phone_number}</td>
                            <td className="p-4 text-center flex justify-center gap-2">
                                <button onClick={()=>handleEdit(adm)} className="p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-600 hover:text-white transition"><Pencil size={18}/></button>
                                <button onClick={()=>handleDelete(adm.id)} className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-600 hover:text-white transition"><Trash2 size={18}/></button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* CSS Helper Inline */}
      <style jsx>{`
        .input-std { @apply p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 w-full text-sm; }
      `}</style>
    </div>
  );
}