// auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server'; // Import ini untuk menggunakan NextResponse.redirect

export const authConfig = {
  // Ini mendefinisikan rute tempat pengguna akan dialihkan jika mereka tidak diautentikasi
  pages: {
    signIn: '/login', // Rute halaman login Anda
  },
  callbacks: {
    // Fungsi ini dipanggil sebelum permintaan selesai.
    // Ini adalah tempat Anda menerapkan logika redireksi.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user; // Cek apakah pengguna sudah login

      // Tentukan rute-rute yang merupakan bagian dari dashboard atau area terproteksi.
      // Sertakan '/' (root path) jika itu adalah halaman dashboard Anda.
      const isTryingToAccessDashboard =
        nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/dashboard');
      
      // Kumpulan rute lain yang secara eksplisit diproteksi.
      const isTryingToAccessProtectedRoutes =
        nextUrl.pathname.startsWith('/vehicles') ||
        nextUrl.pathname.startsWith('/orders') ||
        nextUrl.pathname.startsWith('/users') ||
        nextUrl.pathname.startsWith('/settings'); // Tambahkan rute lain yang diproteksi

      // Gabungkan semua rute yang memerlukan autentikasi.
      const isProtectedRoute = isTryingToAccessDashboard || isTryingToAccessProtectedRoutes;

      // Logika Redireksi:
      // 1. Jika mencoba mengakses rute yang dilindungi, dan belum login,
      //    alihkan ke halaman login.
      if (isProtectedRoute) {
        if (!isLoggedIn) {
          return false; // Mengalihkan ke halaman signIn (yang telah kita definisikan sebagai '/login')
        }
      } 
      // 2. Jika sudah login, dan mencoba mengakses halaman login atau register,
      //    alihkan ke dashboard (yang sekarang adalah '/').
      else if (isLoggedIn) {
        if (nextUrl.pathname === '/login' || nextUrl.pathname === '/register') {
          return NextResponse.redirect(new URL('/', nextUrl)); // Arahkan ke root path
        }
      }

      // Izinkan permintaan berlanjut jika tidak ada kondisi redireksi yang terpenuhi.
      return true;
    },
  },
  // Anda mungkin juga perlu menambahkan provider dan secret di sini
  // providers: [], // Nanti akan diisi di auth.ts
  // secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;