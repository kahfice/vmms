"use client";

import { useState } from "react";
import { createVehicle, updateVehicle } from "../actions";

interface VehicleFormProps {
  vehicle?: any;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function VehicleForm({ vehicle, onSuccess, onCancel }: VehicleFormProps) {
  const [name, setName] = useState(vehicle?.name || "");
  const [type, setType] = useState<"MOTORCYCLE" | "CAR">(vehicle?.type || "MOTORCYCLE");
  const [licensePlate, setLicensePlate] = useState(vehicle?.licensePlate || "");
  const [currentOdometer, setCurrentOdometer] = useState<string>(
    vehicle?.currentOdometer?.toString() || ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama kendaraan harus diisi");
      return;
    }

    if (!currentOdometer || parseFloat(currentOdometer) < 0) {
      setError("Kilometer harus diisi dan bernilai positif");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name,
      type,
      licensePlate: licensePlate || undefined,
      currentOdometer: parseFloat(currentOdometer),
    };

    try {
      let res;
      if (vehicle?.id) {
        res = await updateVehicle(vehicle.id, payload);
      } else {
        res = await createVehicle(payload);
      }

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Gagal menyimpan kendaraan");
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
          Nama Kendaraan *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Honda Vario 150, Yamaha NMAX"
          className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Jenis Kendaraan *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "MOTORCYCLE" | "CAR")}
            className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
            required
          >
            <option value="MOTORCYCLE">Sepeda Motor</option>
            <option value="CAR">Mobil</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Nomor Polisi (Plat Nomor)
          </label>
          <input
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            placeholder="Contoh: B 1234 ABC"
            className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Odometer Saat Ini (km) *
        </label>
        <input
          type="number"
          step="any"
          value={currentOdometer}
          onChange={(e) => setCurrentOdometer(e.target.value)}
          placeholder="Contoh: 12500"
          className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
          required
          disabled={!!vehicle?.id} // Disable in edit mode to prevent direct modification if we want to restrict it, but editable is ok if we want. Let's make it disabled to prevent users bypass tracking, but they can edit it in vehicles CRUD. Actually let's keep it editable.
        />
        {vehicle?.id && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Odometer sebaiknya disesuaikan via pencatatan servis atau tracking perjalanan.
          </p>
        )}
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
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-medium py-2 px-6 rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Kendaraan"}
        </button>
      </div>
    </form>
  );
}
