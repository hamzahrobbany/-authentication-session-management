// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Fungsi GET: Mengambil pengguna berdasarkan ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Periksa apakah pengguna terautentikasi dan memiliki peran 'ADMIN' atau 'OWNER'
    if (!session || !['ADMIN', 'OWNER'].includes(session.profile?.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Cari pengguna berdasarkan ID
    const user = await prisma.user.findUnique({
      where: { id },
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
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Fungsi PUT: Memperbarui pengguna berdasarkan ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Periksa apakah pengguna terautentikasi dan memiliki peran 'ADMIN' atau 'OWNER'
    if (!session || !['ADMIN', 'OWNER'].includes(session.profile?.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, email, password, role, phoneNumber, address, isVerifiedByAdmin } = body;

    // Siapkan data untuk update
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      phoneNumber?: string;
      address?: string;
      isVerifiedByAdmin?: boolean;
    } = { name, email, role, phoneNumber, address, isVerifiedByAdmin };

    // Jika password disediakan dan tidak kosong, hash dulu
    if (password && password.length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Perbarui pengguna di database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { // Pilih kolom yang akan dikembalikan
        id: true,
        name: true,
        email: true,
        role: true,
        isVerifiedByAdmin: true,
        createdAt: true,
      }
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    // Tangani kasus jika ID tidak ditemukan
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Fungsi DELETE: Menghapus pengguna berdasarkan ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Periksa apakah pengguna terautentikasi dan memiliki peran 'ADMIN' atau 'OWNER'
    if (!session || !['ADMIN', 'OWNER'].includes(session.profile?.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Hapus pengguna dari database
    const deletedUser = await prisma.user.delete({
      where: { id },
      select: { id: true, email: true }, // Hanya kembalikan ID dan email pengguna yang dihapus
    });

    return NextResponse.json({ message: `User ${deletedUser.email} deleted successfully` }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    // Tangani kasus jika ID tidak ditemukan
    if (error.code === 'P2025') {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
