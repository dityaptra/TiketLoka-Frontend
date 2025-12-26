"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  DollarSign,
  Ticket,
  Users,
  ShoppingBag,
  Clock,
  X,
  BarChart3,
  TrendingUp,
  Loader2, // Import Loader2
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  total_revenue: number;
  total_bookings: number;
  total_tickets_sold: number;
  total_users: number;
  chart_revenue: { date: string; total: number }[];
  chart_popular: { name: string; total: number }[];
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bgClass: string;
}

export default function AdminDashboard() {
  // 1. Ambil User & Token
  const { user, token } = useAuth();
  
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function fetchStats() {
    // Logika fetch tetap sama, tapi sekarang aman karena dipanggil setelah token siap
    if (!token) return;

    setLoading(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const url = new URL(`${BASE_URL}/api/admin/dashboard`);

      if (startDate) url.searchParams.append("start_date", startDate);
      if (endDate) url.searchParams.append("end_date", endDate);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const json = await res.json();
      if (res.ok) {
        setStats(json.data);
      } else {
        console.error("Gagal memuat dashboard:", json.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Hanya fetch jika token sudah ada
    if (token) {
        fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, startDate, endDate]);

  const resetFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  // 2. PERBAIKAN UTAMA: Tahan Render Sampai User Siap
  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-[600px]">
            <Loader2 size={48} className="text-[#0B2F5E] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Memuat Data...</p>
        </div>
    );
  }

  // Loading Data Fetching
  if (loading)
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
         <Loader2 size={48} className="text-[#0B2F5E] animate-spin" />
      </div>
    );

  if (!stats)
    return (
      <div className="h-full flex items-center justify-center min-h-[400px] text-red-500 font-bold">
        Gagal memuat data statistik.
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Dashboard & Statistik
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan performa penjualan tiket.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-300">
          <div className="flex items-center gap-2 px-2 border-r border-gray-300">
            <Clock size={16} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase">
              Periode
            </span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm border-none outline-none text-gray-600 cursor-pointer bg-transparent"
          />
          <span className="text-gray-300">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm border-none outline-none text-gray-600 cursor-pointer bg-transparent"
          />
          {(startDate || endDate) && (
            <button
              onClick={resetFilter}
              className="p-1 hover:bg-gray-100 rounded-full text-red-500 transition"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Pendapatan"
          value={`Rp ${Number(stats.total_revenue).toLocaleString("id-ID")}`}
          icon={<DollarSign size={24} className="text-white" />}
          bgClass="bg-green-500"
        />
        <StatCard
          label="Total Transaksi"
          value={stats.total_bookings}
          icon={<ShoppingBag size={24} className="text-white" />}
          bgClass="bg-blue-500"
        />
        <StatCard
          label="Tiket Terjual"
          value={stats.total_tickets_sold}
          icon={<Ticket size={24} className="text-white" />}
          bgClass="bg-[#F57C00]"
        />
        <StatCard
          label="Total User"
          value={stats.total_users}
          icon={<Users size={24} className="text-white" />}
          bgClass="bg-purple-500"
        />
      </div>

      {/* DUA GRAFIK UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAFIK 1: Tren Pendapatan */}
        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-[#0B2F5E]" size={20} />
            <h3 className="font-bold text-gray-800">Tren Pendapatan</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chart_revenue}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  tickFormatter={(val) => `Rp${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                  }}
                  formatter={(val: number) => [
                    `Rp ${val.toLocaleString("id-ID")}`,
                    "Pendapatan",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#0B2F5E"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#0B2F5E",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAFIK 2: Wisata Terpopuler */}
        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-[#F57C00]" size={20} />
            <h3 className="font-bold text-gray-800">
              Wisata Terpopuler (Top 5)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            {stats.chart_popular.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.chart_popular}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={100}
                    tick={{
                      fill: "#4B5563",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                    }}
                  />
                  <Bar
                    dataKey="total"
                    fill="#F57C00"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Belum ada data penjualan tiket.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, bgClass }: StatCardProps) {
  return (
    <div className={`p-5 rounded-xl transition-all duration-300 flex items-center justify-between ${bgClass}`}>
      <div className="text-white">
        <p className="text-xs font-bold text-white/80 uppercase tracking-wide mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-extrabold text-white tracking-tight">
            {value}
        </h3>
      </div>
      <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/10">
        {icon}
      </div>
    </div>
  );
}