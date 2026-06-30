"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { computeReminderStatus, ReminderStatus } from "./utils";

export { type ReminderStatus };

const reminderSchema = z.object({
  vehicleId: z.string().min(1, "Kendaraan harus dipilih"),
  title: z.string().min(1, "Nama servis reminder harus diisi"),
  intervalKm: z.number().nullable().optional(),
  intervalMonths: z.number().nullable().optional(),
  lastCompletedKm: z.number().min(0, "Kilometer terakhir tidak boleh negatif").nullable().optional(),
  lastCompletedDate: z.string().or(z.date()).nullable().optional(),
});

export async function getReminders(vehicleId: string) {
  try {
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: { currentOdometer: true },
    });

    if (!vehicle) return [];

    const reminders = await db.serviceReminder.findMany({
      where: { vehicleId },
      orderBy: { createdAt: "desc" },
    });

    // Compute active statuses dynamically
    return reminders.map((reminder) => {
      const computed = computeReminderStatus(
        {
          intervalKm: reminder.intervalKm,
          intervalMonths: reminder.intervalMonths,
          lastCompletedKm: reminder.lastCompletedKm,
          lastCompletedDate: reminder.lastCompletedDate,
        },
        vehicle.currentOdometer
      );

      return {
        ...reminder,
        computedStatus: computed.status,
        remainingKm: computed.remainingKm,
        remainingDays: computed.remainingDays,
      };
    });
  } catch (error) {
    console.error("Failed to fetch reminders:", error);
    return [];
  }
}

export async function createReminder(data: z.infer<typeof reminderSchema>) {
  const validatedData = reminderSchema.parse(data);

  try {
    const lastCompletedDate = validatedData.lastCompletedDate
      ? new Date(validatedData.lastCompletedDate)
      : null;

    const reminder = await db.serviceReminder.create({
      data: {
        vehicleId: validatedData.vehicleId,
        title: validatedData.title,
        intervalKm: validatedData.intervalKm || null,
        intervalMonths: validatedData.intervalMonths || null,
        lastCompletedKm: validatedData.lastCompletedKm ?? null,
        lastCompletedDate,
      },
    });

    revalidatePath("/");
    revalidatePath(`/vehicles/${validatedData.vehicleId}`);
    return { success: true, reminder };
  } catch (error) {
    console.error("Failed to create reminder:", error);
    return { success: false, error: "Gagal membuat reminder" };
  }
}

export async function updateReminder(id: string, data: z.infer<typeof reminderSchema>) {
  const validatedData = reminderSchema.parse(data);

  try {
    const lastCompletedDate = validatedData.lastCompletedDate
      ? new Date(validatedData.lastCompletedDate)
      : null;

    const reminder = await db.serviceReminder.update({
      where: { id },
      data: {
        title: validatedData.title,
        intervalKm: validatedData.intervalKm || null,
        intervalMonths: validatedData.intervalMonths || null,
        lastCompletedKm: validatedData.lastCompletedKm ?? null,
        lastCompletedDate,
      },
    });

    revalidatePath("/");
    revalidatePath(`/vehicles/${validatedData.vehicleId}`);
    return { success: true, reminder };
  } catch (error) {
    console.error("Failed to update reminder:", error);
    return { success: false, error: "Gagal memperbarui reminder" };
  }
}

export async function deleteReminder(id: string, vehicleId: string) {
  try {
    await db.serviceReminder.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath(`/vehicles/${vehicleId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete reminder:", error);
    return { success: false, error: "Gagal menghapus reminder" };
  }
}

// Trigger this function to update status column in db whenever odometer is updated
export async function syncRemindersStatusInDb(vehicleId: string, currentOdometer: number) {
  try {
    const reminders = await db.serviceReminder.findMany({
      where: { vehicleId },
    });

    for (const reminder of reminders) {
      const computed = computeReminderStatus(
        {
          intervalKm: reminder.intervalKm,
          intervalMonths: reminder.intervalMonths,
          lastCompletedKm: reminder.lastCompletedKm,
          lastCompletedDate: reminder.lastCompletedDate,
        },
        currentOdometer
      );

      if (reminder.status !== computed.status) {
        await db.serviceReminder.update({
          where: { id: reminder.id },
          data: { status: computed.status },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to sync reminders status:", error);
    return { success: false, error };
  }
}
