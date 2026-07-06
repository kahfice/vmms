"use client";

import { useState, useEffect } from "react";
import VehicleSelector from "@/features/vehicles/components/VehicleSelector";
import TrackingControl from "@/features/tracking/components/TrackingControl";
import ReminderList from "@/features/reminders/components/ReminderList";
import ServiceHistoryList from "@/features/history/components/ServiceHistoryList";
import StatsDashboard from "@/features/statistics/components/StatsDashboard";
import { updateOdometer } from "@/features/vehicles/actions";
import {
  Bike,
  Car,
  LayoutDashboard,
  Calendar,
  History,
  BarChart3,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Gauge,
  CircleAlert,
  Edit2,
  DollarSign,
  Route,
  LogOut,
} from "lucide-react";
import { logout } from "@/features/auth/actions";

interface ClientDashboardProps {
  vehicles: any[];
  remindersMap: Record<string, any[]>;
  historyMap: Record<string, any[]>;
  tripLogsMap: Record<string, any[]>;
}

export default function ClientDashboard({
  vehicles: initialVehicles,
  remindersMap,
  historyMap,
  tripLogsMap,
}: ClientDashboardProps) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(
    initialVehicles.length > 0 ? initialVehicles[0].id : null
  );
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "reminders" | "history" | "stats" | "settings"
  >("dashboard");

  const [darkMode, setDarkMode] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [unit, setUnit] = useState<"km" | "mi">("km");
  const [isEditingOdometer, setIsEditingOdometer] = useState(false);
  const [newOdometerVal, setNewOdometerVal] = useState("");

  useEffect(() => {
    // Sync initial theme
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const [prevInitialVehicles, setPrevInitialVehicles] = useState(initialVehicles);

  if (initialVehicles !== prevInitialVehicles) {
    setPrevInitialVehicles(initialVehicles);
    setVehicles(initialVehicles);
    if (initialVehicles.length > 0 && !initialVehicles.some((v) => v.id === activeVehicleId)) {
      setActiveVehicleId(initialVehicles[0].id);
    }
  }

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setDarkMode(true);
    }
  };

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      await logout();
      window.location.href = "/login";
    }
  };

  if (!activeVehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <Bike className="h-16 w-16 text-indigo-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Selamat Datang di VMMS</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Mulai kelola perawatan kendaraan Anda. Daftarkan kendaraan pertama Anda sekarang.
          </p>
          <VehicleSelector
            vehicles={[]}
            activeVehicleId={null}
            onSelectVehicle={(id) => setActiveVehicleId(id)}
          />
        </div>
      </div>
    );
  }

  const reminders = remindersMap[activeVehicle.id] || [];
  const histories = historyMap[activeVehicle.id] || [];
  const tripLogs = tripLogsMap[activeVehicle.id] || [];

  // Calculate high level metrics
  const activeRemindersCount = reminders.filter((r) =>
    ["WARNING", "CRITICAL", "DUE", "OVERDUE"].includes(r.computedStatus)
  ).length;

  const dueReminders = reminders.filter((r) => ["DUE", "OVERDUE"].includes(r.computedStatus));

  // Today's total distance
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDistance = tripLogs
    .filter((log) => new Date(log.date).toISOString().split("T")[0] === todayStr)
    .reduce((acc, log) => acc + log.distanceTraveled, 0);

  // Spent this month
  const currentMonthYear = new Date().toISOString().substring(0, 7); // YYYY-MM
  const monthlySpent = histories
    .filter((h) => new Date(h.serviceDate).toISOString().substring(0, 7) === currentMonthYear)
    .reduce((acc, h) => acc + h.totalCost, 0);

  const handleUpdateOdometerDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newOdometerVal);
    if (isNaN(val) || val < activeVehicle.currentOdometer) {
      alert("Odometer baru tidak boleh lebih kecil dari odometer saat ini");
      return;
    }

    try {
      const res = await updateOdometer(activeVehicle.id, val);
      if (res.success) {
        setIsEditingOdometer(false);
        // Update local state to reflect change instantly
        setVehicles((prev) =>
          prev.map((v) => (v.id === activeVehicle.id ? { ...v, currentOdometer: val } : v))
        );
        window.location.reload(); // Refresh server state
      } else {
        alert(res.error || "Gagal mengubah odometer");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* Top Navbar */}
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 md:px-8 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <Gauge className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900 dark:text-white leading-tight">
              VMMS
            </h1>
            <p className="text-[10px] md:text-xs font-medium text-slate-400">
              Vehicle Maintenance Management
            </p>
          </div>
        </div>

        {/* Right Nav Options */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            title="Ganti Tema"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <VehicleSelector
            vehicles={vehicles}
            activeVehicleId={activeVehicle.id}
            onSelectVehicle={(id) => setActiveVehicleId(id)}
          />
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-24 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar (Desktop) / Bottom Nav (Mobile) */}
        <nav className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 h-fit sticky top-24 hidden lg:flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2 block">
            Menu Utama
          </span>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full py-2.5 px-3.5 rounded-xl font-semibold text-sm flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("reminders")}
            className={`w-full py-2.5 px-3.5 rounded-xl font-semibold text-sm flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "reminders"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4.5 w-4.5" />
              Reminders
            </div>
            {activeRemindersCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {activeRemindersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`w-full py-2.5 px-3.5 rounded-xl font-semibold text-sm flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "history"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
            }`}
          >
            <History className="h-4.5 w-4.5" />
            Riwayat Servis
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`w-full py-2.5 px-3.5 rounded-xl font-semibold text-sm flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "stats"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
            }`}
          >
            <BarChart3 className="h-4.5 w-4.5" />
            Statistik
          </button>
  <button
            onClick={() => setActiveTab("settings")}
            className={`w-full py-2.5 px-3.5 rounded-xl font-semibold text-sm flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "settings"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
            }`}
          >
            <SettingsIcon className="h-4.5 w-4.5" />
            Pengaturan
          </button>
          
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
          
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3.5 rounded-xl font-semibold text-sm flex items-center gap-2.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            Keluar (Logout)
          </button>
        </nav>

        {/* Content Workspace */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Odometer & Quick Info Banner */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-2xl shadow-sm text-white p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
              {activeVehicle.type === "CAR" ? (
                <Car className="h-48 w-48" />
              ) : (
                <Bike className="h-48 w-48" />
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-semibold tracking-wider">
                    {activeVehicle.type === "CAR" ? "MOBIL" : "MOTOR"}
                  </span>
                  {activeVehicle.licensePlate && (
                    <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded-md">
                      {activeVehicle.licensePlate}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black mb-1">{activeVehicle.name}</h2>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs text-indigo-100">Odometer Saat Ini:</span>
                  <span className="font-mono font-bold text-lg">
                    {activeVehicle.currentOdometer.toLocaleString("id-ID")} km
                  </span>
                  <button
                    onClick={() => {
                      setNewOdometerVal(activeVehicle.currentOdometer.toString());
                      setIsEditingOdometer(true);
                    }}
                    className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick stats on banner */}
              <div className="grid grid-cols-2 gap-4 border-l border-white/20 pl-0 md:pl-6">
                <div>
                  <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">
                    Jarak Tempuh Hari Ini
                  </p>
                  <p className="text-xl font-black">{parseFloat(todayDistance.toFixed(2))} km</p>
                </div>
                <div>
                  <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">
                    Biaya Servis Bulan Ini
                  </p>
                  <p className="text-xl font-black">Rp {monthlySpent.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Reminders / Notifications banner */}
          {dueReminders.length > 0 && notifEnabled && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <CircleAlert className="h-6 w-6 text-red-500 shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <h4 className="font-bold text-sm text-red-800 dark:text-red-300">
                  Perlu Tindakan: Ada {dueReminders.length} reminder jatuh tempo!
                </h4>
                <ul className="text-xs text-red-700 dark:text-red-400 mt-1.5 space-y-1 list-disc pl-4 font-medium">
                  {dueReminders.map((r) => (
                    <li key={r.id}>
                      {r.title}
                      {r.remainingKm !== null && r.remainingKm <= 0 && (
                        <span> (Lewat {Math.abs(Math.round(r.remainingKm))} km)</span>
                      )}
                      {r.remainingDays !== null && r.remainingDays <= 0 && (
                        <span> (Lewat {Math.abs(r.remainingDays)} hari)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Inner Tab Panels */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <TrackingControl
                  vehicleId={activeVehicle.id}
                  vehicleName={activeVehicle.name}
                  currentOdometer={activeVehicle.currentOdometer}
                />
              </div>

              <div className="md:col-span-1">
                {/* Dashboard Side Widget: Recent services */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 flex items-center justify-between">
                    Servis Terakhir
                    <button
                      onClick={() => setActiveTab("history")}
                      className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold cursor-pointer"
                    >
                      Lihat Semua
                    </button>
                  </h3>
                  {histories.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Belum ada riwayat servis</p>
                  ) : (
                    <div className="space-y-3">
                      {histories.slice(0, 3).map((h) => (
                        <div
                          key={h.id}
                          className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-b-0 last:pb-0"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {new Date(h.serviceDate).toLocaleDateString("id-ID")}
                            </span>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-semibold">
                              {h.odometer} km
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5 truncate">
                            {h.workshopName || "Bengkel Umum"}
                          </p>
                          <p className="font-bold text-xs text-slate-850 dark:text-slate-200">
                            Rp {h.totalCost.toLocaleString("id-ID")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reminders" && (
            <ReminderList vehicleId={activeVehicle.id} reminders={reminders} />
          )}

          {activeTab === "history" && (
            <ServiceHistoryList
              vehicleId={activeVehicle.id}
              currentOdometer={activeVehicle.currentOdometer}
              histories={histories}
            />
          )}

          {activeTab === "stats" && (
            <StatsDashboard
              vehicleId={activeVehicle.id}
              tripLogs={tripLogs}
              serviceHistories={histories}
            />
          )}

          {activeTab === "settings" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Pengaturan Aplikasi</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Konfigurasi preferensi akun dan aplikasi</p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Theme Selector */}
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-white">
                      Tema Aplikasi
                    </span>
                    <span className="block text-xs text-slate-400">
                      Ganti antara mode Terang dan Gelap
                    </span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-medium py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {darkMode ? (
                      <>
                        <Sun className="h-4 w-4" /> Mode Terang
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" /> Mode Gelap
                      </>
                    )}
                  </button>
                </div>

                {/* Notifications toggle */}
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-white">
                      Notifikasi Pengingat Servis
                    </span>
                    <span className="block text-xs text-slate-400">
                      Tampilkan notifikasi penting di halaman dashboard
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifEnabled}
                      onChange={(e) => setNotifEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Kilometer Unit options */}
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-white">
                      Satuan Jarak
                    </span>
                    <span className="block text-xs text-slate-400">
                      Pilih satuan jarak odometer (Kilometer / Mil)
                    </span>
                  </div>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as "km" | "mi")}
                    className="border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-3 text-xs bg-white dark:bg-slate-900 focus:outline-none text-slate-800 dark:text-white"
                  >
                    <option value="km">Kilometer (km)</option>
                    <option value="mi">Mil (mi)</option>
                  </select>
                </div>

                {/* Logout Option */}
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold text-red-600 dark:text-red-400">
                      Keluar dari Akun
                    </span>
                    <span className="block text-xs text-slate-400">
                      Akhiri sesi Anda pada perangkat ini
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium py-1.5 px-4 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav Bar (Mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 px-3 flex justify-around items-center lg:hidden z-40 shadow-lg">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-lg text-slate-500 cursor-pointer ${
            activeTab === "dashboard" ? "text-indigo-600 dark:text-indigo-400" : ""
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] font-bold">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab("reminders")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-lg text-slate-500 relative cursor-pointer ${
            activeTab === "reminders" ? "text-indigo-600 dark:text-indigo-400" : ""
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[9px] font-bold">Reminders</span>
          {activeRemindersCount > 0 && (
            <span className="absolute top-1 right-2 bg-red-500 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full">
              {activeRemindersCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-lg text-slate-500 cursor-pointer ${
            activeTab === "history" ? "text-indigo-600 dark:text-indigo-400" : ""
          }`}
        >
          <History className="h-5 w-5" />
          <span className="text-[9px] font-bold">Riwayat</span>
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-lg text-slate-500 cursor-pointer ${
            activeTab === "stats" ? "text-indigo-600 dark:text-indigo-400" : ""
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-[9px] font-bold">Statistik</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-lg text-slate-500 cursor-pointer ${
            activeTab === "settings" ? "text-indigo-600 dark:text-indigo-400" : ""
          }`}
        >
          <SettingsIcon className="h-5 w-5" />
          <span className="text-[9px] font-bold">Setting</span>
        </button>
      </nav>

      {/* Edit Odometer Dialog */}
      {isEditingOdometer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-3">
              Perbarui Odometer Kendaraan
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              Masukkan pembacaan kilometer saat ini secara manual.
            </p>
            <form onSubmit={handleUpdateOdometerDirectly} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Kilometer Baru (km) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={newOdometerVal}
                  onChange={(e) => setNewOdometerVal(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingOdometer(false)}
                  className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium py-2 px-4 rounded-lg text-sm transition-colors text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium py-2 px-6 rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
