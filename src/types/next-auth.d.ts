// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  // Perluas objek User yang dikembalikan oleh authorize
  interface User {
    id: string;
    role: "CUSTOMER" | "OWNER" | "ADMIN"; // Tambahkan role Anda
    isVerifiedByAdmin: boolean; // Tambahkan properti verifikasi
  }

  // Perluas objek Session
  interface Session {
    user: {
      id: string; // Tambahkan ID ke user di sesi
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    profile: { // Tambahkan objek profile kustom
      role: "CUSTOMER" | "OWNER" | "ADMIN";
      isVerifiedByAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  // Perluas objek JWT Token
  interface JWT {
    id: string; // Tambahkan ID ke token
    role: "CUSTOMER" | "OWNER" | "ADMIN"; // Tambahkan role ke token
    isVerifiedByAdmin: boolean; // Tambahkan properti verifikasi ke token
    picture?: string | null; // Tambahkan picture jika Anda menggunakannya
  }
}