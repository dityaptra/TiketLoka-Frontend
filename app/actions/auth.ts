'use server'

import { cookies } from 'next/headers'

export async function createSession(token: string, role: string) {
  // Tentukan durasi cookie (misal 7 hari)
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  const expires = new Date(Date.now() + oneWeek)

  // 1. Simpan Token (HttpOnly - AMAN DARI XSS)
  // JavaScript di browser TIDAK BISA membaca ini
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })

  // 2. Simpan Role (Boleh tidak HttpOnly jika butuh dibaca middleware/client, 
  // tapi lebih aman HttpOnly dan simpan state di Context)
  cookies().set('user_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  // Hapus cookie saat logout atau error
  cookies().delete('token')
  cookies().delete('user_role')
}