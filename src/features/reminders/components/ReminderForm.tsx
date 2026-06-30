"use client";

import { useState } from "react";
import { createReminder, updateReminder } from "../actions";

interface ReminderFormProps {
  vehicleId: string;
  reminder?: any;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function ReminderForm({ vehicleId, reminder, onSuccess, onCancel }: ReminderFormProps) {
  const [title, setTitle] = useState(reminder?.title || "");
  const [intervalKm, setIntervalKm] = useState<string>(reminder?.intervalKm?.toString() || "");
  const [intervalMonths, setIntervalMonths] = useState<string>(reminder?.intervalMonths?.toString() || "");
  const [lastCompletedKm, setLastCompletedKm] = useState<string>(reminder?.lastCompletedKm?.toString() || "");

  // Format Date to YYYY-MM-DD
  const formatInputDate = (dateVal: any) => {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };
  const [lastCompletedDate, setLastCompletedDate] = useState<string>(
    formatInputDate(reminder?.lastCompletedDate)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Nama servis reminder harus diisi");
      return;
    }

    if (!intervalKm && !intervalMonths) {
      setError("Harus mengisi minimal salah satu interval (kilometer atau waktu)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      vehicleId,
      title,
      intervalKm: intervalKm ? parseInt(intervalKm) : null,
      intervalMonths: intervalMonths ? parseInt(intervalMonths) : null,
      lastCompletedKm: lastCompletedKm ? parseFloat(lastCompletedKm) : null,
      lastCompletedDate: lastCompletedDate || null,
    };

    try {
      let res;
      if (reminder?.id) {
        res = await updateReminder(reminder.id, payload);
      } else {
        res = await createReminder(payload);
      }

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Gagal menyimpan pengingat");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-3 text-xs text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Nama Servis / Suku Cadang *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Ganti Oli Mesin, Kampas Rem Depan"
          className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Interval Kilometer (km)
          </label>
          <input
            type="number"
            value={intervalKm}
            onChange={(e) => setIntervalKm(e.target.value)}
            placeholder="Contoh: 2500"
            className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Interval Waktu (Bulan)
          </label>
          <input
            type="number"
            value={intervalMonths}
            onChange={(e) => setIntervalMonths(e.target.value)}
            placeholder="Contoh: 3"
            className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50 space-y-3">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
          Catatan Terakhir Servis (Opsional)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Kilometer Terakhir
            </label>
            <input
              type="number"
              step="any"
              value={lastCompletedKm}
              onChange={(e) => setLastCompletedKm(e.target.value)}
              placeholder="Contoh: 12000"
              className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Tanggal Terakhir
            </label>
            <input
              type="date"
              value={lastCompletedDate}
              onChange={(e) => setLastCompletedDate(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium py-2 px-4 rounded-lg text-sm transition-colors text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Pengingat"}
        </button>
      </div>
    </form>
  );
}
