// src/lib/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { AuthOptions } from "next-auth" // Mengimpor AuthOptions
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
  // Adapter untuk integrasi dengan Prisma
  adapter: PrismaAdapter(prisma),

  // Konfigurasi provider autentikasi
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials Provider (untuk login dengan email/password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          // Penting: Kembalikan null atau throw Error untuk kegagalan otorisasi
          // NextAuth akan mengarahkan ke halaman error yang dikonfigurasi
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordCorrect) {
          return null
        }

        // Jika autentikasi berhasil, kembalikan objek user
        // NextAuth akan menyimpan ini di JWT dan sesi.
        // Penting: Pastikan objek user memiliki properti 'role' dan 'isVerifiedByAdmin'
        // sesuai dengan model Prisma Anda.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role, // Pastikan ini ada di model User Prisma Anda
          isVerifiedByAdmin: user.isVerifiedByAdmin, // Pastikan ini ada di model User Prisma Anda
        }
      },
    }),
  ],

  // Konfigurasi halaman kustom
  pages: {
    signIn: "/login",
    error: "/login", // Mengarahkan error ke halaman login
  },

  // Konfigurasi sesi
  session: {
    strategy: "jwt", // Menggunakan JWT untuk sesi
    maxAge: 30 * 24 * 60 * 60, // Sesi berlaku selama 30 hari
  },

  // Konfigurasi callback JWT dan Session
  callbacks: {
    // Callback JWT: Menambahkan properti kustom ke token JWT
    async jwt({ token, user }) {
      // 'user' objek hanya tersedia saat login pertama kali (setelah authorize)
      // atau ketika menggunakan adapter database.
      // Kita tambahkan properti kustom dari objek user ke token JWT.
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Asumsikan 'role' ada di objek user
        token.isVerifiedByAdmin = (user as any).isVerifiedByAdmin; // Asumsikan 'isVerifiedByAdmin' ada di objek user
      }
      // token.picture sudah diatur secara default oleh NextAuth jika ada di user.image
      // Hindari `token = { ...token, user }` karena bisa membuat token terlalu besar.
      return token;
    },

    // Callback Session: Menambahkan properti kustom dari token ke objek sesi
    async session({ session, token }) {
      // Pastikan token dan session.user ada
      if (token && session.user) {
        // Transfer ID dari token ke session.user
        session.user.id = token.id as string;

        // Buat objek 'profile' di sesi untuk properti kustom
        // Ini lebih rapi daripada menyebarkan seluruh token
        session.profile = {
          role: token.role as string,
          isVerifiedByAdmin: token.isVerifiedByAdmin as boolean,
        };

        // Perbarui gambar pengguna di sesi jika ada di token (opsional, NextAuth sering menangani ini)
        if (token.picture) {
          session.user.image = token.picture;
        }
      }
      // console.log("Session callback:", session); // Aktifkan untuk debugging jika diperlukan
      return session;
    },
  },
  // Debugging (aktifkan di development untuk melihat log NextAuth)
  debug: process.env.NODE_ENV === "development",
}

// Tidak perlu mengekspor default NextAuth(authOptions) dari sini
// Karena Anda sudah mengimpor authOptions di app/api/auth/[...nextauth]/route.ts
// dan di sana NextAuth diekspor sebagai handler.
