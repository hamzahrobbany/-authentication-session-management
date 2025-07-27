// app/api/users/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Untuk mendapatkan sesi pengguna
import { authOptions } from "@/lib/auth"; // Impor konfigurasi NextAuth.js Anda
import prisma from "@/lib/prisma"; // Impor instance Prisma Client Anda
import bcrypt from "bcryptjs"; // Untuk hashing password

// Fungsi GET: Mengambil daftar semua pengguna
export async function GET(request: Request) {
  try {
    // Dapatkan sesi pengguna untuk otorisasi
    const session = await getServerSession(authOptions);

    // Periksa apakah pengguna terautentikasi dan memiliki peran 'ADMIN' atau 'OWNER'
    if (!session || !['ADMIN', 'OWNER'].includes(session.profile?.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ambil semua pengguna dari database
    const users = await prisma.user.findMany({
      // Pilih kolom yang ingin Anda tampilkan (hindari password)
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerifiedByAdmin: true,
        phoneNumber: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        image: true, // Tambahkan image jika ingin ditampilkan
      },
      orderBy: {
        createdAt: "desc", // Urutkan berdasarkan tanggal pembuatan terbaru
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Fungsi POST: Membuat pengguna baru
export async function POST(request: Request) {
  try {
    // Dapatkan sesi pengguna untuk otorisasi
    const session = await getServerSession(authOptions);

    // Periksa apakah pengguna terautentikasi dan memiliki peran 'ADMIN' atau 'OWNER'
    if (!session || !['ADMIN', 'OWNER'].includes(session.profile?.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role, phoneNumber, address, isVerifiedByAdmin } = body;

    // Validasi input dasar
    if (!email || !password || !role) {
      return NextResponse.json({ message: "Email, password, and role are required" }, { status: 400 });
    }

    // Periksa apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    // Hash password sebelum menyimpan
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

    // Buat pengguna baru di database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phoneNumber,
        address,
        isVerifiedByAdmin: isVerifiedByAdmin || false, // Default false jika tidak disediakan
      },
      select: { // Pilih kolom yang akan dikembalikan
        id: true,
        name: true,
        email: true,
        role: true,
        isVerifiedByAdmin: true,
        createdAt: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
