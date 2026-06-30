"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const vehicleSchema = z.object({
  name: z.string().min(1, "Nama kendaraan harus diisi"),
  type: z.enum(["MOTORCYCLE", "CAR"]),
  licensePlate: z.string().optional(),
  currentOdometer: z.number().min(0, "Kilometer tidak boleh negatif"),
});

export async function getVehicles(userId = "default-user-id") {
  try {
    return await db.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    return [];
  }
}

export async function getVehicleById(id: string) {
  try {
    return await db.vehicle.findUnique({
      where: { id },
      include: {
        reminders: true,
        serviceHistories: {
          orderBy: { serviceDate: "desc" },
          include: { items: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch vehicle by ID:", error);
    return null;
  }
}

export async function createVehicle(data: z.infer<typeof vehicleSchema> & { userId?: string }) {
  const validatedData = vehicleSchema.parse(data);
  const userId = data.userId || "default-user-id";

  try {
    const vehicle = await db.vehicle.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        licensePlate: validatedData.licensePlate || null,
        currentOdometer: validatedData.currentOdometer,
        userId,
      },
    });
    revalidatePath("/");
    revalidatePath("/vehicles");
    return { success: true, vehicle };
  } catch (error) {
    console.error("Failed to create vehicle:", error);
    return { success: false, error: "Gagal menambahkan kendaraan" };
  }
}

export async function updateVehicle(id: string, data: z.infer<typeof vehicleSchema>) {
  const validatedData = vehicleSchema.parse(data);

  try {
    const vehicle = await db.vehicle.update({
      where: { id },
      data: {
        name: validatedData.name,
        type: validatedData.type,
        licensePlate: validatedData.licensePlate || null,
        currentOdometer: validatedData.currentOdometer,
      },
    });
    revalidatePath("/");
    revalidatePath(`/vehicles/${id}`);
    return { success: true, vehicle };
  } catch (error) {
    console.error("Failed to update vehicle:", error);
    return { success: false, error: "Gagal memperbarui kendaraan" };
  }
}

export async function deleteVehicle(id: string) {
  try {
    await db.vehicle.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/vehicles");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete vehicle:", error);
    return { success: false, error: "Gagal menghapus kendaraan" };
  }
}

export async function updateOdometer(id: string, newOdometer: number) {
  try {
    const currentVehicle = await db.vehicle.findUnique({
      where: { id },
      select: { currentOdometer: true },
    });

    if (!currentVehicle) {
      return { success: false, error: "Kendaraan tidak ditemukan" };
    }

    if (newOdometer < currentVehicle.currentOdometer) {
      return { success: false, error: "Odometer baru tidak boleh lebih kecil dari odometer saat ini" };
    }

    const vehicle = await db.vehicle.update({
      where: { id },
      data: { currentOdometer: newOdometer },
    });

    revalidatePath("/");
    revalidatePath(`/vehicles/${id}`);
    return { success: true, vehicle };
  } catch (error) {
    console.error("Failed to update odometer:", error);
    return { success: false, error: "Gagal memperbarui odometer" };
  }
}
