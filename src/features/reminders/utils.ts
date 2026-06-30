export type ReminderStatus = "ACTIVE" | "WARNING" | "CRITICAL" | "DUE" | "OVERDUE";

export function computeReminderStatus(
  reminder: {
    intervalKm: number | null;
    intervalMonths: number | null;
    lastCompletedKm: number | null;
    lastCompletedDate: Date | null;
  },
  currentOdometer: number
) {
  const statuses: { type: "km" | "date"; status: ReminderStatus; remaining: number }[] = [];
  const today = new Date();

  // 1. Calculate Odometer-based status
  if (reminder.intervalKm && reminder.lastCompletedKm !== null) {
    const targetKm = reminder.lastCompletedKm + reminder.intervalKm;
    const remainingKm = targetKm - currentOdometer;

    let status: ReminderStatus = "ACTIVE";
    if (remainingKm < -100) {
      status = "OVERDUE";
    } else if (remainingKm <= 0) {
      status = "DUE";
    } else if (remainingKm <= 100) {
      status = "CRITICAL";
    } else if (remainingKm <= 200) {
      status = "WARNING";
    }

    statuses.push({ type: "km", status, remaining: remainingKm });
  }

  // 2. Calculate Time-based status
  if (reminder.intervalMonths && reminder.lastCompletedDate) {
    const lastDate = new Date(reminder.lastCompletedDate);
    const targetDate = new Date(lastDate);
    targetDate.setMonth(targetDate.getMonth() + reminder.intervalMonths);

    // Calculate diff in days
    const diffTime = targetDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: ReminderStatus = "ACTIVE";
    if (remainingDays < -7) {
      status = "OVERDUE";
    } else if (remainingDays <= 0) {
      status = "DUE";
    } else if (remainingDays <= 7) {
      status = "CRITICAL";
    } else if (remainingDays <= 14) {
      status = "WARNING";
    }

    statuses.push({ type: "date", status, remaining: remainingDays });
  }

  if (statuses.length === 0) {
    return { status: "ACTIVE" as ReminderStatus, remainingKm: null, remainingDays: null };
  }

  // Determine the most critical status
  const severity: Record<ReminderStatus, number> = {
    ACTIVE: 0,
    WARNING: 1,
    CRITICAL: 2,
    DUE: 3,
    OVERDUE: 4,
  };

  let mostSevere = statuses[0];
  for (let i = 1; i < statuses.length; i++) {
    if (severity[statuses[i].status] > severity[mostSevere.status]) {
      mostSevere = statuses[i];
    }
  }

  const kmStatus = statuses.find((s) => s.type === "km");
  const dateStatus = statuses.find((s) => s.type === "date");

  return {
    status: mostSevere.status,
    remainingKm: kmStatus ? kmStatus.remaining : null,
    remainingDays: dateStatus ? dateStatus.remaining : null,
  };
}
