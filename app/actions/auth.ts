'use server'

import { cookies } from 'next/headers'

export async function createSession(token: string, role: string) {
  // 1. Tentukan durasi cookie (misal 7 hari)
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  const expires = new Date(Date.now() + oneWeek)

  // 2. AMBIL COOKIE STORE DENGAN AWAIT (KHUSUS NEXT.JS 15)
  const cookieStore = await cookies()

  // 3. Simpan Token (HttpOnly)
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })

  // 4. Simpan Role
  cookieStore.set('user_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  // Hapus cookie saat logout
  const cookieStore = await cookies() // <--- Jangan lupa await di sini juga
  cookieStore.delete('token')
  cookieStore.delete('user_role')
}