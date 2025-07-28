// app/api/vehicles/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import supabase from "@/lib/supabase"; // Impor Supabase Client
import { v4 as uuidv4 } from 'uuid'; // Untuk membuat nama file unik

// Fungsi GET: Mengambil daftar semua kendaraan
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Hanya ADMIN dan OWNER yang bisa melihat daftar kendaraan
    if (!session || !['ADMIN', 'OWNER'].includes(session.profile?.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(vehicles, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Fungsi POST: Membuat kendaraan baru (termasuk upload gambar)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Hanya ADMIN dan OWNER yang bisa membuat kendaraan baru
    if (!session || !['ADMIN', 'OWNER'].includes(session.profile?.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const make = formData.get("make") as string;
    const model = formData.get("model") as string;
    const year = parseInt(formData.get("year") as string);
    const licensePlate = formData.get("licensePlate") as string;
    const rentalRate = parseFloat(formData.get("rentalRate") as string);
    const description = formData.get("description") as string;
    const isAvailable = formData.get("isAvailable") === "true";
    const type = formData.get("type") as string; // New field
    const capacity = parseInt(formData.get("capacity") as string); // New field
    const transmissionType = formData.get("transmissionType") as string; // New field
    const fuelType = formData.get("fuelType") as string; // New field
    const dailyRate = parseFloat(formData.get("dailyRate") as string); // New field
    const lateFeePerDay = parseFloat(formData.get("lateFeePerDay") as string); // New field
    const city = formData.get("city") as string; // New field
    const address = formData.get("address") as string; // New field
    const imageFile = formData.get("image") as File | null;

    // Validasi input dasar
    if (!make || !model || isNaN(year) || !licensePlate || isNaN(rentalRate) || !type || isNaN(capacity) || !transmissionType || !fuelType || isNaN(dailyRate) || isNaN(lateFeePerDay) || !city) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Periksa apakah plat nomor sudah ada
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { licensePlate },
    });

    if (existingVehicle) {
      return NextResponse.json({ message: "Vehicle with this license plate already exists" }, { status: 409 });
    }

    let imageUrl: string | null = null;

    // Upload gambar ke Supabase Storage jika ada
    if (imageFile && imageFile.size > 0) {
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`; // Nama file unik
      const filePath = `vehicles/${fileName}`; // Path di bucket Supabase

      const { data, error: uploadError } = await supabase.storage
        .from('vehicle-images') // Ganti dengan nama bucket Anda
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json({ message: "Failed to upload image", error: uploadError.message }, { status: 500 });
      }

      // Dapatkan URL publik gambar
      const { data: publicUrlData } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    // Buat kendaraan baru di database
    const newVehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        year,
        licensePlate,
        rentalRate,
        description,
        isAvailable,
        type: type as any, // Cast ke VehicleType enum
        capacity,
        transmissionType: transmissionType as any, // Cast ke TransmissionType enum
        fuelType: fuelType as any, // Cast ke FuelType enum
        dailyRate,
        lateFeePerDay,
        city,
        address,
        imageUrl,
        ownerId: session.user.id, // Set pemilik kendaraan ke user yang sedang login
      },
    });

    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
