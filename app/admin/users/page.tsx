"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Trash2, UserPlus, Shield, Pencil } from "lucide-react"; // + Import Pencil
import Swal from "sweetalert2";
import api from "@/lib/axios";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone_number: string;
}

export default function ManageAdmins() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State (Untuk Tambah Baru)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Proteksi Halaman
  if (user && user.role !== 'owner') {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center">
            <Shield size={64} className="text-gray-300 mb-4"/>
            <h2 className="text-2xl font-bold text-gray-800">Akses Ditolak</h2>
            <p className="text-gray-500">Hanya Owner yang dapat mengakses halaman ini.</p>
        </div>
      );
  }

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/api/owner/admins");
      setAdmins(res.data.data);
    } catch (error) {
      console.error("Gagal load admin", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // --- FUNGSI TAMBAH ADMIN ---
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
        Swal.fire("Error", "Semua kolom wajib diisi!", "error");
        return;
    }
    try {
      Swal.fire({ title: 'Menyimpan...', didOpen: () => Swal.showLoading() });
      await api.post("/api/owner/admins", { name, email, password, phone_number: phone });
      Swal.fire("Sukses", "Admin berhasil ditambahkan", "success");
      setName(""); setEmail(""); setPassword(""); setPhone("");
      fetchAdmins();
    } catch (error: any) {
      Swal.fire("Gagal", error.response?.data?.message || "Terjadi kesalahan", "error");
    }
  };

  // --- FUNGSI HAPUS ADMIN ---
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Admin ini?",
      text: "Akses login mereka akan dicabut permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/owner/admins/${id}`);
        Swal.fire("Terhapus!", "Admin telah dihapus.", "success");
        fetchAdmins();
      } catch (error) {
        Swal.fire("Gagal", "Tidak bisa menghapus admin.", "error");
      }
    }
  };

  // --- FUNGSI EDIT ADMIN (BARU) ---
  const handleEdit = async (admin: AdminUser) => {
    const { value: formValues } = await Swal.fire({
      title: `Edit Admin: ${admin.name}`,
      html: `
        <div class="text-left space-y-3">
            <div>
                <label class="text-sm font-bold text-gray-600">Nama Lengkap</label>
                <input id="swal-name" class="swal2-input w-full m-0 mt-1" value="${admin.name}" placeholder="Nama">
            </div>
            <div>
                <label class="text-sm font-bold text-gray-600">Email Login</label>
                <input id="swal-email" class="swal2-input w-full m-0 mt-1" value="${admin.email}" placeholder="Email">
            </div>
            <div>
                <label class="text-sm font-bold text-gray-600">No. Telepon</label>
                <input id="swal-phone" class="swal2-input w-full m-0 mt-1" value="${admin.phone_number}" placeholder="Telepon">
            </div>
            <div>
                <label class="text-sm font-bold text-gray-600">Password Baru (Opsional)</label>
                <input id="swal-pass" type="password" class="swal2-input w-full m-0 mt-1" placeholder="Isi jika ingin ganti password">
            </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan Perubahan',
      confirmButtonColor: '#0B2F5E',
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
        // Validasi simpel
        if(!formValues.name || !formValues.email) {
            Swal.fire("Gagal", "Nama dan Email tidak boleh kosong", "error");
            return;
        }

        Swal.fire({ title: 'Mengupdate...', didOpen: () => Swal.showLoading() });
        
        // Kirim request ke backend
        await api.put(`/api/owner/admins/${admin.id}`, formValues);
        
        Swal.fire("Sukses", "Data admin berhasil diperbarui", "success");
        fetchAdmins();
      } catch (error: any) {
        Swal.fire("Gagal", error.response?.data?.message || "Gagal update admin", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0B2F5E]">Kelola Admin (Owner)</h1>

      {/* FORM TAMBAH (Kiri) & SUMMARY (Kanan - Opsional) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-[#F57C00]"/> Tambah Admin Baru
        </h3>
        <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
                type="text" placeholder="Nama Lengkap" 
                value={name} onChange={e => setName(e.target.value)}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <input 
                type="email" placeholder="Email Login" 
                value={email} onChange={e => setEmail(e.target.value)}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <input 
                type="text" placeholder="Nomor Telepon" 
                value={phone} onChange={e => setPhone(e.target.value)}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <input 
                type="password" placeholder="Password" 
                value={password} onChange={e => setPassword(e.target.value)}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
            />
            
            <div className="md:col-span-2 text-right mt-2">
                <button type="submit" className="bg-[#0B2F5E] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-900 transition shadow-lg shadow-blue-900/20">
                    + Simpan Admin
                </button>
            </div>
        </form>
      </div>

      {/* TABEL LIST ADMIN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="p-4 text-sm font-bold text-gray-600">No</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Nama Admin</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Email</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Telepon</th>
                    <th className="p-4 text-sm font-bold text-gray-600 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-400">Memuat data...</td></tr>
                ) : admins.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-400">Belum ada admin lain.</td></tr>
                ) : (
                    admins.map((admin, index) => (
                        <tr key={admin.id} className="hover:bg-blue-50/30 transition">
                            <td className="p-4 text-gray-600 font-medium">{index + 1}</td>
                            <td className="p-4 text-gray-800 font-bold">{admin.name}</td>
                            <td className="p-4 text-gray-600">{admin.email}</td>
                            <td className="p-4 text-gray-600">{admin.phone_number}</td>
                            <td className="p-4 text-center flex justify-center gap-2">
                                {/* TOMBOL EDIT */}
                                <button 
                                    onClick={() => handleEdit(admin)}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
                                    title="Edit Admin"
                                >
                                    <Pencil size={18} />
                                </button>
                                {/* TOMBOL HAPUS */}
                                <button 
                                    onClick={() => handleDelete(admin.id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                                    title="Hapus Admin"
                                >
                                    <Trash2 size={18} />
                                </button>
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