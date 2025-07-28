// app/api/vehicles/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import supabase from "@/lib/supabase"; // Impor Supabase Client
import { v4 as uuidv4 } from 'uuid'; // Untuk membuat nama file unik

// Fungsi GET: Mengambil kendaraan berdasarkan ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Hanya ADMIN dan OWNER yang bisa melihat detail kendaraan
    if (!session || !['ADMIN', 'OWNER'].includes(session.profile?.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Fungsi PUT: Memperbarui kendaraan (termasuk update/hapus gambar)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Hanya ADMIN dan OWNER yang bisa memperbarui kendaraan
    if (!session || !['ADMIN', 'OWNER'].includes(session.profile?.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const formData = await request.formData();

    // Ambil data yang mungkin diupdate
    const make = formData.get("make") as string | null;
    const model = formData.get("model") as string | null;
    const year = formData.get("year") ? parseInt(formData.get("year") as string) : undefined;
    const licensePlate = formData.get("licensePlate") as string | null;
    const rentalRate = formData.get("rentalRate") ? parseFloat(formData.get("rentalRate") as string) : undefined;
    const description = formData.get("description") as string | null;
    const isAvailable = formData.get("isAvailable") === "true"; // Perhatikan boolean
    const type = formData.get("type") as string | null;
    const capacity = formData.get("capacity") ? parseInt(formData.get("capacity") as string) : undefined;
    const transmissionType = formData.get("transmissionType") as string | null;
    const fuelType = formData.get("fuelType") as string | null;
    const dailyRate = formData.get("dailyRate") ? parseFloat(formData.get("dailyRate") as string) : undefined;
    const lateFeePerDay = formData.get("lateFeePerDay") ? parseFloat(formData.get("lateFeePerDay") as string) : undefined;
    const city = formData.get("city") as string | null;
    const address = formData.get("address") as string | null;

    const imageFile = formData.get("image") as File | null; // File baru
    const removeExistingImage = formData.get("removeExistingImage") === "true"; // Flag untuk menghapus gambar yang ada

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { imageUrl: true, licensePlate: true },
    });

    if (!existingVehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }

    let newImageUrl: string | null | undefined = existingVehicle.imageUrl; // Default ke gambar yang sudah ada

    // Logika penghapusan gambar lama
    if (removeExistingImage && existingVehicle.imageUrl) {
      const oldImagePath = existingVehicle.imageUrl.split('vehicle-images/')[1]; // Dapatkan path relatif
      if (oldImagePath) {
        const { error: deleteError } = await supabase.storage
          .from('vehicle-images')
          .remove([oldImagePath]);

        if (deleteError) {
          console.error("Supabase delete old image error:", deleteError);
          // Lanjutkan proses tanpa menghentikan, mungkin gambar sudah tidak ada
        }
      }
      newImageUrl = null; // Set URL gambar menjadi null setelah dihapus
    }

    // Logika upload gambar baru
    if (imageFile && imageFile.size > 0) {
      // Jika ada gambar lama dan tidak diminta untuk dihapus, hapus gambar lama terlebih dahulu
      // Ini penting jika gambar baru akan menggantikan yang lama
      if (existingVehicle.imageUrl && !removeExistingImage) {
        const oldImagePath = existingVehicle.imageUrl.split('vehicle-images/')[1];
        if (oldImagePath) {
          const { error: deleteError } = await supabase.storage
            .from('vehicle-images')
            .remove([oldImagePath]);
          if (deleteError) {
            console.warn("Supabase warning: Failed to delete old image before new upload:", deleteError);
          }
        }
      }

      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `vehicles/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload new image error:", uploadError);
        return NextResponse.json({ message: "Failed to upload new image", error: uploadError.message }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(filePath);

      newImageUrl = publicUrlData.publicUrl;
    }


    const updateData: { [key: string]: any } = {};
    if (make !== null) updateData.make = make;
    if (model !== null) updateData.model = model;
    if (year !== undefined) updateData.year = year;
    if (licensePlate !== null) updateData.licensePlate = licensePlate;
    if (rentalRate !== undefined) updateData.rentalRate = rentalRate;
    if (description !== null) updateData.description = description;
    updateData.isAvailable = isAvailable; // isAvailable selalu dikirim
    if (type !== null) updateData.type = type;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (transmissionType !== null) updateData.transmissionType = transmissionType;
    if (fuelType !== null) updateData.fuelType = fuelType;
    if (dailyRate !== undefined) updateData.dailyRate = dailyRate;
    if (lateFeePerDay !== undefined) updateData.lateFeePerDay = lateFeePerDay;
    if (city !== null) updateData.city = city;
    if (address !== null) updateData.address = address;
    updateData.imageUrl = newImageUrl; // Gunakan URL gambar yang sudah diperbarui

    // Pastikan licensePlate tidak duplikat jika diubah
    if (licensePlate && licensePlate !== existingVehicle.licensePlate) {
      const duplicateCheck = await prisma.vehicle.findUnique({
        where: { licensePlate },
      });
      if (duplicateCheck && duplicateCheck.id !== id) {
        return NextResponse.json({ message: "License plate already in use by another vehicle." }, { status: 409 });
      }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedVehicle, { status: 200 });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Fungsi DELETE: Menghapus kendaraan (termasuk gambar dari Supabase)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Hanya ADMIN dan OWNER yang bisa menghapus kendaraan
    if (!session || !['ADMIN', 'OWNER'].includes(session.profile?.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const vehicleToDelete = await prisma.vehicle.findUnique({
      where: { id },
      select: { imageUrl: true, make: true, model: true },
    });

    if (!vehicleToDelete) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }

    // Hapus gambar dari Supabase Storage jika ada
    if (vehicleToDelete.imageUrl) {
      // Ekstrak path file dari URL publik Supabase
      const imagePath = vehicleToDelete.imageUrl.split('vehicle-images/')[1]; // Sesuaikan dengan nama bucket Anda
      if (imagePath) {
        const { error: deleteError } = await supabase.storage
          .from('vehicle-images') // Ganti dengan nama bucket Anda
          .remove([imagePath]);

        if (deleteError) {
          console.error("Supabase image deletion error:", deleteError);
          // Anda bisa memilih untuk mengembalikan error atau melanjutkan
          // Untuk saat ini, kita akan melanjutkan penghapusan record di DB
        }
      }
    }

    // Hapus kendaraan dari database
    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ message: `Vehicle ${vehicleToDelete.make} ${vehicleToDelete.model} deleted successfully` }, { status: 200 });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
