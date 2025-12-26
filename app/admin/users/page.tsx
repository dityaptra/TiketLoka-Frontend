"use client";

import { useState, useEffect, useCallback } from "react";
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
  const { user, token } = useAuth();
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // --- STYLE UNTUK INPUT FORM (Didefinisikan di sini agar rapi) ---
  const inputClassName = "w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#0B2F5E] outline-none transition-all placeholder-gray-400";
  const labelClassName = "block text-sm font-bold text-gray-700 mb-1";

  // 1. FETCH DATA
  const fetchAdmins = useCallback(async () => {
    if (!token) return; 

    try {
      const res = await fetch(`${BASE_URL}/api/owner/admins`, {
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
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
  }, [token, BASE_URL]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // PROTEKSI Loading & Role
  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh]">
            <Loader2 size={48} className="text-[#0B2F5E] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Memeriksa izin akses...</p>
        </div>
    );
  }

  if (user.role !== 'owner') {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center opacity-80 animate-in fade-in duration-500">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Lock size={48} className="text-gray-400"/>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
            <p className="text-gray-500 max-w-md">
                Halaman ini dilindungi. Hanya <span className="font-bold text-[#0B2F5E]">Owner</span> yang memiliki otoritas untuk mengelola akun admin.
            </p>
        </div>
      );
  }

  // --- HANDLERS ---
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
              "Accept": "application/json",
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

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Admin?", 
      text: "Akses login mereka akan hilang selamanya.",
      icon: "warning", 
      showCancelButton: true, 
      confirmButtonColor: "#d33", 
      confirmButtonText: "Ya, Hapus"
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ didOpen: () => Swal.showLoading() });
        const res = await fetch(`${BASE_URL}/api/owner/admins/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            Swal.fire("Terhapus", "Admin telah dihapus.", "success");
            fetchAdmins();
        } else {
            Swal.fire("Gagal", "Gagal menghapus admin", "error");
        }
      } catch (e) { Swal.fire("Gagal", "Error koneksi", "error"); }
    }
  };

  const handleEdit = async (admin: AdminUser) => {
    const { value: formValues } = await Swal.fire({
      title: `Edit ${admin.name}`,
      html: `
        <div class="text-left space-y-3">
            <div>
                <label class="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label>
                <input id="swal-name" class="swal2-input w-full m-0 mt-1" placeholder="Nama" value="${admin.name}">
            </div>
            <div>
                <label class="text-xs font-bold text-gray-500 uppercase">Email Login</label>
                <input id="swal-email" class="swal2-input w-full m-0 mt-1" placeholder="Email" value="${admin.email}">
            </div>
            <div>
                <label class="text-xs font-bold text-gray-500 uppercase">No. Telepon</label>
                <input id="swal-phone" class="swal2-input w-full m-0 mt-1" placeholder="Telepon" value="${admin.phone_number}">
            </div>
            <div>
                <label class="text-xs font-bold text-gray-500 uppercase">Password Baru (Opsional)</label>
                <input id="swal-pass" type="password" class="swal2-input w-full m-0 mt-1" placeholder="Isi jika ingin ganti password">
            </div>
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
                "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(formValues)
        });
        if (res.ok) {
            Swal.fire("Sukses", "Data berhasil diperbarui", "success");
            fetchAdmins();
        } else {
             const json = await res.json();
            throw new Error(json.message || "Gagal update");
        }
      } catch (error: any) { Swal.fire("Gagal", error.message, "error"); }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0B2F5E]">Kelola Admin (Super Admin)</h1>

      {/* FORM CREATE - DIPERBAIKI STYLINGNYA */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 border-b pb-4">
            <UserPlus size={20} className="text-[#F57C00]"/> Tambah Admin Baru
        </h3>
        
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div>
                <label className={labelClassName}>Nama Lengkap</label>
                <input 
                    value={name} 
                    onChange={e=>setName(e.target.value)} 
                    placeholder="Contoh: Budi Santoso" 
                    className={inputClassName} 
                    required
                />
            </div>

            {/* Email */}
            <div>
                <label className={labelClassName}>Email Login</label>
                <input 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    placeholder="Contoh: budi@tiketloka.com" 
                    type="email" 
                    className={inputClassName} 
                    required
                />
            </div>

            {/* Telepon */}
            <div>
                <label className={labelClassName}>No. Telepon</label>
                <input 
                    value={phone} 
                    onChange={e=>setPhone(e.target.value)} 
                    placeholder="Contoh: 08123456789" 
                    className={inputClassName} 
                    required
                />
            </div>

            {/* Password */}
            <div>
                <label className={labelClassName}>Password</label>
                <input 
                    value={password} 
                    onChange={e=>setPassword(e.target.value)} 
                    placeholder="Minimal 6 karakter" 
                    type="password" 
                    className={inputClassName} 
                    required
                />
            </div>
            
            <div className="md:col-span-2 pt-2">
                <button type="submit" className="w-full bg-[#0B2F5E] text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10">
                    <Shield size={18}/> Simpan Admin
                </button>
            </div>
        </form>
      </div>

      {/* TABLE LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="p-4 text-sm font-bold text-gray-600">Nama</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Email</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Telepon</th>
                    <th className="p-4 text-center text-sm font-bold text-gray-600">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                    <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-800"/></td></tr>
                ) : admins.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">Belum ada admin lain yang terdaftar.</td></tr>
                ) : (
                    admins.map((adm) => (
                        <tr key={adm.id} className="hover:bg-blue-50/50 transition duration-150">
                            <td className="p-4 font-bold text-gray-700">{adm.name}</td>
                            <td className="p-4 text-gray-600 text-sm">{adm.email}</td>
                            <td className="p-4 text-gray-600 text-sm">{adm.phone_number}</td>
                            <td className="p-4 text-center flex justify-center gap-2">
                                <button onClick={()=>handleEdit(adm)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition"><Pencil size={18}/></button>
                                <button onClick={()=>handleDelete(adm.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition"><Trash2 size={18}/></button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}