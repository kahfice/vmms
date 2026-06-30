"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { syncRemindersStatusInDb } from "../reminders/actions";

const serviceItemSchema = z.object({
  name: z.string().min(1, "Nama item harus diisi"),
  brand: z.string().optional().nullable(),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  quantity: z.number().min(1, "Jumlah minimal 1"),
  notes: z.string().optional().nullable(),
});

const serviceHistorySchema = z.object({
  vehicleId: z.string().min(1, "Kendaraan harus dipilih"),
  serviceDate: z.string().or(z.date()),
  odometer: z.number().min(0, "Odometer tidak boleh negatif"),
  workshopName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  receiptPhoto: z.string().optional().nullable(),
  items: z.array(serviceItemSchema),
});

export async function getServiceHistories(vehicleId: string) {
  try {
    return await db.serviceHistory.findMany({
      where: { vehicleId },
      include: { items: true },
      orderBy: { serviceDate: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch service histories:", error);
    return [];
  }
}

export async function createServiceHistory(data: z.infer<typeof serviceHistorySchema>) {
  const validated = serviceHistorySchema.parse(data);
  const totalCost = validated.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Create the service history with items
      const history = await tx.serviceHistory.create({
        data: {
          vehicleId: validated.vehicleId,
          serviceDate: new Date(validated.serviceDate),
          odometer: validated.odometer,
          workshopName: validated.workshopName || null,
          notes: validated.notes || null,
          receiptPhoto: validated.receiptPhoto || null,
          totalCost,
          items: {
            create: validated.items.map((item) => ({
              name: item.name,
              brand: item.brand || null,
              price: item.price,
              quantity: item.quantity,
              notes: item.notes || null,
            })),
          },
        },
        include: { items: true },
      });

      // 2. If this service odometer is greater than the vehicle's current odometer, update it!
      const vehicle = await tx.vehicle.findUnique({
        where: { id: validated.vehicleId },
        select: { currentOdometer: true },
      });

      let updatedOdometer = vehicle?.currentOdometer || 0;
      if (vehicle && validated.odometer > vehicle.currentOdometer) {
        await tx.vehicle.update({
          where: { id: validated.vehicleId },
          data: { currentOdometer: validated.odometer },
        });
        updatedOdometer = validated.odometer;
      }

      // 3. Auto-update matching Service Reminders!
      // If a reminder title matches any of the items serviced, or the notes/workshop,
      // reset lastCompletedKm and lastCompletedDate of that reminder.
      const reminders = await tx.serviceReminder.findMany({
        where: { vehicleId: validated.vehicleId },
      });

      for (const reminder of reminders) {
        // Match reminder title to service items (case insensitive)
        const isMatched = validated.items.some((item) =>
          item.name.toLowerCase().includes(reminder.title.toLowerCase()) ||
          reminder.title.toLowerCase().includes(item.name.toLowerCase())
        );

        if (isMatched) {
          await tx.serviceReminder.update({
            where: { id: reminder.id },
            data: {
              lastCompletedKm: validated.odometer,
              lastCompletedDate: new Date(validated.serviceDate),
            },
          });
        }
      }

      return { history, updatedOdometer };
    });

    // Sync statuses in DB
    await syncRemindersStatusInDb(validated.vehicleId, result.updatedOdometer);

    revalidatePath("/");
    revalidatePath(`/vehicles/${validated.vehicleId}`);
    return { success: true, history: result.history };
  } catch (error) {
    console.error("Failed to create service history:", error);
    return { success: false, error: "Gagal mencatat riwayat servis" };
  }
}

export async function deleteServiceHistory(id: string, vehicleId: string) {
  try {
    await db.serviceHistory.delete({
      where: { id },
    });

    // Refresh odometer and reminders (get the max odometer from history as fallbacks)
    const latestHistory = await db.serviceHistory.findFirst({
      where: { vehicleId },
      orderBy: { odometer: "desc" },
      select: { odometer: true },
    });

    if (latestHistory) {
      await db.vehicle.update({
        where: { id: vehicleId },
        data: { currentOdometer: latestHistory.odometer },
      });
      await syncRemindersStatusInDb(vehicleId, latestHistory.odometer);
    }

    revalidatePath("/");
    revalidatePath(`/vehicles/${vehicleId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete service history:", error);
    return { success: false, error: "Gagal menghapus riwayat servis" };
  }
}
