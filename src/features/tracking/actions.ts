"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateOdometer } from "../vehicles/actions";
import { syncRemindersStatusInDb } from "../reminders/actions";

const tripLogSchema = z.object({
  vehicleId: z.string().min(1, "Kendaraan harus dipilih"),
  distanceTraveled: z.number().positive("Jarak harus lebih besar dari 0"),
  date: z.string().or(z.date()).optional(),
});

export async function getTripLogs(vehicleId: string) {
  try {
    return await db.tripLog.findMany({
      where: { vehicleId },
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch trip logs:", error);
    return [];
  }
}

export async function createTripLog(data: z.infer<typeof tripLogSchema>) {
  const validated = tripLogSchema.parse(data);
  const tripDate = validated.date ? new Date(validated.date) : new Date();

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Save trip log
      const trip = await tx.tripLog.create({
        data: {
          vehicleId: validated.vehicleId,
          distanceTraveled: validated.distanceTraveled,
          date: tripDate,
        },
      });

      // 2. Fetch current vehicle odometer
      const vehicle = await tx.vehicle.findUnique({
        where: { id: validated.vehicleId },
        select: { currentOdometer: true },
      });

      if (!vehicle) {
        throw new Error("Kendaraan tidak ditemukan");
      }

      // 3. Update vehicle odometer by adding distanceTraveled
      const newOdometer = vehicle.currentOdometer + validated.distanceTraveled;
      const updatedVehicle = await tx.vehicle.update({
        where: { id: validated.vehicleId },
        data: { currentOdometer: newOdometer },
      });

      // 4. Update reminder status in database
      const reminders = await tx.serviceReminder.findMany({
        where: { vehicleId: validated.vehicleId },
      });

      // Simple import/local implementation of reminders calculation inside transaction
      // We can also call the syncRemindersStatusInDb but inside transaction we do it manually or after transaction
      return { trip, updatedVehicle };
    });

    // Sync reminders status in DB
    await syncRemindersStatusInDb(validated.vehicleId, result.updatedVehicle.currentOdometer);

    revalidatePath("/");
    revalidatePath(`/vehicles/${validated.vehicleId}`);
    return { success: true, trip: result.trip, newOdometer: result.updatedVehicle.currentOdometer };
  } catch (error) {
    console.error("Failed to create trip log:", error);
    return { success: false, error: "Gagal menyimpan log perjalanan" };
  }
}

export async function getTripStats(vehicleId: string) {
  try {
    const tripLogs = await db.tripLog.findMany({
      where: { vehicleId },
      orderBy: { date: "asc" },
    });

    // Group by date (YYYY-MM-DD) for charts
    const dailyStats: Record<string, number> = {};
    const monthlyStats: Record<string, number> = {};

    tripLogs.forEach((log) => {
      const dateStr = log.date.toISOString().split("T")[0];
      const monthStr = log.date.toISOString().substring(0, 7); // YYYY-MM

      dailyStats[dateStr] = (dailyStats[dateStr] || 0) + log.distanceTraveled;
      monthlyStats[monthStr] = (monthlyStats[monthStr] || 0) + log.distanceTraveled;
    });

    return {
      daily: Object.entries(dailyStats).map(([date, distance]) => ({ date, distance: parseFloat(distance.toFixed(2)) })),
      monthly: Object.entries(monthlyStats).map(([month, distance]) => ({ month, distance: parseFloat(distance.toFixed(2)) })),
    };
  } catch (error) {
    console.error("Failed to get trip stats:", error);
    return { daily: [], monthly: [] };
  }
}
