import axios from "axios";

// Membuat instance Axios
const api = axios.create({
  // URL API diambil dari Environment Variable (Vercel)
  // Fallback ke localhost jika env tidak ditemukan
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  withCredentials: true, 
  
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => {
    // Jika sukses (Status 200-299), kembalikan respon apa adanya
    return response;
  },
  (error) => {
    // Tangani error di sini
    if (error.response) {
      // Cek jika error 401 (Token Expired / Tidak Login)
      if (error.response.status === 401) {
        console.warn("Sesi kadaluarsa atau user belum login.");
        
        // Opsional: Redirect paksa ke halaman login jika sesi mati
        // window.location.href = "/login"; 
      }
    } else if (error.request) {
      // Error karena tidak ada respon dari server (Network Error / Server Down)
      console.error("Tidak ada respon dari server:", error.request);
    } else {
      // Error lainnya
      console.error("Terjadi kesalahan:", error.message);
    }

    // Lempar error agar bisa ditangkap oleh catch() di halaman masing-masing
    return Promise.reject(error);
  }
);

export default api;