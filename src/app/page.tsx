import { db } from "@/lib/db";
import ClientDashboard from "./ClientDashboard";
import { computeReminderStatus } from "@/features/reminders/utils";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

async function ensureDefaultVehicleForUser(userId: string, email: string, name: string) {
  // Check if user exists
  let user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    try {
      user = await db.user.create({
        data: {
          id: userId,
          email,
          name,
        },
      });
    } catch (e) {
      console.error("Failed to create user:", e);
    }
  }

  // Check if any vehicle exists for this user
  const vehicleCount = await db.vehicle.count({
    where: { userId },
  });

  if (vehicleCount === 0 && user) {
    try {
      // Seed default vehicle and reminders
      const vehicle = await db.vehicle.create({
        data: {
          name: "Honda Vario 150",
          type: "MOTORCYCLE",
          licensePlate: "B 1234 ABC",
          currentOdometer: 12500.5,
          userId: user.id,
        },
      });

      // Seed reminders
      const remindersData = [
        {
          title: "Ganti Oli Mesin",
          intervalKm: 2500,
          intervalMonths: 3,
          lastCompletedKm: 12000,
          lastCompletedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
        {
          title: "Servis CVT & Roller",
          intervalKm: 8000,
          intervalMonths: 6,
          lastCompletedKm: 8000,
          lastCompletedDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 150 days ago
        },
        {
          title: "Kampas Rem Depan",
          intervalKm: 10000,
          intervalMonths: 12,
          lastCompletedKm: 12000,
          lastCompletedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      ];

      for (const r of remindersData) {
        await db.serviceReminder.create({
          data: {
            ...r,
            vehicleId: vehicle.id,
            status: "ACTIVE",
          },
        });
      }

      // Seed some trip logs for stats
      const tripLogsData = [
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), distanceTraveled: 12.4 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), distanceTraveled: 18.2 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), distanceTraveled: 9.8 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), distanceTraveled: 25.1 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), distanceTraveled: 14.5 },
        { date: new Date(), distanceTraveled: 8.2 },
      ];

      for (const log of tripLogsData) {
        await db.tripLog.create({
          data: {
            vehicleId: vehicle.id,
            date: log.date,
            distanceTraveled: log.distanceTraveled,
          },
        });
      }
    } catch (e) {
      console.error("Failed to seed vehicle for user:", e);
    }
  }
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  const email = user.email || "";
  const name = user.user_metadata?.name || email.split("@")[0];

  // Ensure we have a vehicle seeded for the authenticated user
  await ensureDefaultVehicleForUser(userId, email, name);

  // Fetch all vehicles for the user
  const vehicles = await db.vehicle.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const remindersMap: Record<string, any[]> = {};
  const historyMap: Record<string, any[]> = {};
  const tripLogsMap: Record<string, any[]> = {};

  // Prefetch data for each vehicle
  for (const vehicle of vehicles) {
    const reminders = await db.serviceReminder.findMany({
      where: { vehicleId: vehicle.id },
      orderBy: { createdAt: "desc" },
    });

    const histories = await db.serviceHistory.findMany({
      where: { vehicleId: vehicle.id },
      include: { items: true },
      orderBy: { serviceDate: "desc" },
    });

    const tripLogs = await db.tripLog.findMany({
      where: { vehicleId: vehicle.id },
      orderBy: { date: "desc" },
    });

    // Compute dynamic warning statuses for reminders
    const computedReminders = reminders.map((reminder) => {
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

    remindersMap[vehicle.id] = computedReminders;
    historyMap[vehicle.id] = histories;
    tripLogsMap[vehicle.id] = tripLogs;
  }

  return (
    <ClientDashboard
      vehicles={vehicles}
      remindersMap={remindersMap}
      historyMap={historyMap}
      tripLogsMap={tripLogsMap}
    />
  );
}

