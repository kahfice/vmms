import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.tripLog.deleteMany({});
  await prisma.serviceHistoryItem.deleteMany({});
  await prisma.serviceHistory.deleteMany({});
  await prisma.serviceReminder.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});

  // Create default user
  const user = await prisma.user.create({
    data: {
      id: "default-user-id",
      email: "user@vmms.com",
      name: "Pengguna VMMS",
    },
  });

  console.log(`Created user: ${user.name}`);

  // Create default vehicle
  const vehicle = await prisma.vehicle.create({
    data: {
      id: "default-vehicle-id",
      name: "Honda Vario 150",
      type: "MOTORCYCLE",
      licensePlate: "B 1234 ABC",
      currentOdometer: 12500.5,
      userId: user.id,
    },
  });

  console.log(`Created vehicle: ${vehicle.name}`);

  // Create default service reminders
  const remindersData = [
    {
      title: "Ganti Oli Mesin",
      intervalKm: 2500,
      intervalMonths: 3,
      lastCompletedKm: 12000,
      lastCompletedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      status: "ACTIVE",
    },
    {
      title: "Servis CVT & Roller",
      intervalKm: 8000,
      intervalMonths: 6,
      lastCompletedKm: 8000,
      lastCompletedDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 150 days ago
      status: "ACTIVE",
    },
    {
      title: "Kampas Rem Depan",
      intervalKm: 10000,
      intervalMonths: 12,
      lastCompletedKm: 12000,
      lastCompletedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      status: "ACTIVE",
    },
    {
      title: "Filter Udara",
      intervalKm: 12000,
      intervalMonths: 12,
      lastCompletedKm: 0,
      lastCompletedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 365 days ago
      status: "ACTIVE",
    },
  ];

  for (const reminder of remindersData) {
    await prisma.serviceReminder.create({
      data: {
        ...reminder,
        vehicleId: vehicle.id,
      },
    });
  }

  console.log("Created service reminders");

  // Create service history
  const history1 = await prisma.serviceHistory.create({
    data: {
      vehicleId: vehicle.id,
      serviceDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 150 days ago
      odometer: 8000,
      workshopName: "AHASS Motor Sentosa",
      notes: "Servis rutin & servis CVT pertama",
      totalCost: 245000,
      items: {
        create: [
          { name: "Oli Mesin SPX2", brand: "AHM", price: 55000, quantity: 1, notes: "Oli sintetis" },
          { name: "Oli Gardan", brand: "AHM", price: 15000, quantity: 1 },
          { name: "Roller Set CVT", brand: "AHM Original", price: 90000, quantity: 1 },
          { name: "Jasa Servis CVT", brand: "-", price: 85000, quantity: 1 },
        ],
      },
    },
  });

  const history2 = await prisma.serviceHistory.create({
    data: {
      vehicleId: vehicle.id,
      serviceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      odometer: 12000,
      workshopName: "AHASS Motor Sentosa",
      notes: "Ganti oli dan kampas rem depan karena sudah tipis",
      totalCost: 115000,
      items: {
        create: [
          { name: "Oli Mesin SPX2", brand: "AHM", price: 55000, quantity: 1 },
          { name: "Kampas Rem Depan", brand: "AHM Original", price: 60000, quantity: 1 },
        ],
      },
    },
  });

  console.log(`Created service histories: ${history1.id}, ${history2.id}`);

  // Create trip logs for stats (last 7 days)
  const tripLogsData = [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), distanceTraveled: 12.4 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), distanceTraveled: 18.2 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), distanceTraveled: 9.8 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), distanceTraveled: 25.1 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), distanceTraveled: 14.5 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), distanceTraveled: 20.3 },
    { date: new Date(), distanceTraveled: 8.2 },
  ];

  for (const trip of tripLogsData) {
    await prisma.tripLog.create({
      data: {
        vehicleId: vehicle.id,
        date: trip.date,
        distanceTraveled: trip.distanceTraveled,
      },
    });
  }

  console.log("Created trip logs");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
