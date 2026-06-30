"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, DollarSign, Route, Award } from "lucide-react";

interface StatsDashboardProps {
  vehicleId: string;
  tripLogs: any[];
  serviceHistories: any[];
}

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function StatsDashboard({
  vehicleId,
  tripLogs,
  serviceHistories,
}: StatsDashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-slate-500 animate-pulse bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-800">
        Loading statistik...
      </div>
    );
  }

  // 1. Prepare Trip Logs Data (Daily Mileage)
  // Last 7 days
  const dailyMileageData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const grouped: Record<string, number> = {};
    tripLogs.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split("T")[0];
      grouped[dateStr] = (grouped[dateStr] || 0) + log.distanceTraveled;
    });

    return last7Days.map((date) => {
      const d = new Date(date);
      const label = d.toLocaleDateString("id-ID", { weekday: "short" });
      return {
        date: label,
        distance: parseFloat((grouped[date] || 0).toFixed(2)),
      };
    });
  };

  // 2. Prepare Monthly Costs Data
  const monthlyCostData = () => {
    const monthlyCosts: Record<string, number> = {};
    serviceHistories.forEach((history) => {
      const date = new Date(history.serviceDate);
      const monthYear = date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      monthlyCosts[monthYear] = (monthlyCosts[monthYear] || 0) + history.totalCost;
    });

    // Sort or just map to array (reversing historical order to chronological)
    return Object.entries(monthlyCosts)
      .map(([month, cost]) => ({ month, cost }))
      .reverse()
      .slice(-6); // Max 6 months
  };

  // 3. Prepare Item Category Breakdown (Pie Chart)
  const itemBreakdownData = () => {
    const categories: Record<string, number> = {};
    serviceHistories.forEach((history) => {
      history.items.forEach((item: any) => {
        // Simple categorisation based on keywords
        let category = "Lain-lain";
        const name = item.name.toLowerCase();
        if (name.includes("oli") || name.includes("gardan") || name.includes("fluid")) {
          category = "Pelumas/Oli";
        } else if (name.includes("rem") || name.includes("pad") || name.includes("kampas")) {
          category = "Sistem Rem";
        } else if (name.includes("roller") || name.includes("cvt") || name.includes("belt") || name.includes("van")) {
          category = "Transmisi/CVT";
        } else if (name.includes("filter") || name.includes("saringan")) {
          category = "Filter Udara/Bensin";
        } else if (name.includes("ban") || name.includes("tire") || name.includes("velg")) {
          category = "Roda & Ban";
        } else if (name.includes("jasa") || name.includes("servis") || name.includes("up")) {
          category = "Jasa Servis";
        }

        categories[category] = (categories[category] || 0) + item.price * item.quantity;
      });
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  // Calculate high-level stats
  const totalCost = serviceHistories.reduce((acc, h) => acc + h.totalCost, 0);
  const totalTrips = tripLogs.length;
  const totalKmTracked = tripLogs.reduce((acc, log) => acc + log.distanceTraveled, 0);

  const costChartData = monthlyCostData();
  const mileageChartData = dailyMileageData();
  const pieChartData = itemBreakdownData();

  return (
    <div className="space-y-6">
      {/* Mini Stats Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 p-3 rounded-lg">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Total Pengeluaran
            </p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">
              Rp {totalCost.toLocaleString("id-ID")}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 p-3 rounded-lg">
            <Route className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Jarak Tempuh Dilacak
            </p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">
              {parseFloat(totalKmTracked.toFixed(2))} km
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Total Perjalanan
            </p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">
              {totalTrips} Trip
            </h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-base text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            Pengeluaran Servis Bulanan
          </h3>
          <div className="h-64 w-full">
            {costChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                Belum ada data pengeluaran
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickFormatter={(val) => `Rp ${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val) => val !== undefined && val !== null ? [`Rp ${Number(val).toLocaleString("id-ID")}`, "Biaya"] : ["Rp 0", "Biaya"]}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Bar dataKey="cost" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Mileage Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-base text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
            <Route className="h-5 w-5 text-cyan-500" />
            Jarak Harian (7 Hari Terakhir)
          </h3>
          <div className="h-64 w-full">
            {mileageChartData.every((d) => d.distance === 0) ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                Belum ada data jarak tempuh harian
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mileageChartData}>
                  <defs>
                    <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val} km`} />
                  <Tooltip
                    formatter={(val) => val !== undefined && val !== null ? [`${val} km`, "Jarak"] : ["0 km", "Jarak"]}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="distance"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDistance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      {pieChartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-base text-slate-800 dark:text-white mb-4">
            Alokasi Pengeluaran Servis
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            <div className="h-60 w-60 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => val !== undefined && val !== null ? `Rp ${Number(val).toLocaleString("id-ID")}` : "Rp 0"} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-sm">
              {pieChartData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white">
                    Rp {item.value.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
