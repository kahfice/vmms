"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useGeolocationTracking } from "@/hooks/useGeolocationTracking";
import { createTripLog } from "../actions";
import { Play, Square, Navigation, AlertTriangle } from "lucide-react";

const LeafletMap = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] md:h-[400px] w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-lg text-slate-500 animate-pulse border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col items-center gap-2">
        <Navigation className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Memuat peta...</span>
      </div>
    </div>
  ),
});

interface TrackingControlProps {
  vehicleId: string;
  vehicleName: string;
  currentOdometer: number;
}

export default function TrackingControl({
  vehicleId,
  vehicleName,
  currentOdometer,
}: TrackingControlProps) {
  const router = useRouter();
  const {
    isTracking,
    coordinates,
    distance,
    currentSpeed,
    error,
    startTracking,
    stopTracking,
    resetTracking,
  } = useGeolocationTracking();

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleStart = () => {
    setSuccessMsg(null);
    startTracking();
  };

  const handleStop = async () => {
    stopTracking();
    if (distance < 0.1) {
      alert("Perjalanan kurang dari 100 meter. Data perjalanan tidak disimpan.");
      resetTracking();
      return;
    }

    setIsSaving(true);
    try {
      const res = await createTripLog({
        vehicleId,
        distanceTraveled: distance,
      });

      if (res.success) {
        setSuccessMsg(`Perjalanan berhasil disimpan! +${distance} km telah ditambahkan ke odometer.`);
        router.refresh();
      } else {
        alert(res.error || "Gagal menyimpan log perjalanan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan data perjalanan");
    } finally {
      setIsSaving(false);
      resetTracking();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tracking Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Pelacak Perjalanan GPS</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Mencatat kilometer secara otomatis untuk <span className="font-medium text-indigo-500">{vehicleName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isTracking ? "bg-red-500 animate-ping" : "bg-slate-300 dark:bg-slate-700"
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isTracking ? "Tracking Aktif" : "Standby"}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Kesalahan GPS:</span> {error}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-4 mb-4 text-sm text-emerald-800 dark:text-emerald-200 font-medium">
            {successMsg}
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Trip Aktif</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {distance} <span className="text-xs font-medium text-slate-500">km</span>
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Kecepatan</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {currentSpeed !== null ? currentSpeed : 0}{" "}
              <span className="text-xs font-medium text-slate-500">km/j</span>
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Odometer</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {parseFloat((currentOdometer + (isTracking ? distance : 0)).toFixed(2))}{" "}
              <span className="text-xs font-medium text-slate-500">km</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!isTracking ? (
            <button
              onClick={handleStart}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="h-5 w-5 fill-current" />
              Mulai Perjalanan
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={isSaving}
              className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Square className="h-5 w-5 fill-current animate-pulse" />
              {isSaving ? "Menyimpan..." : "Selesai Perjalanan"}
            </button>
          )}
        </div>
      </div>

      {/* Map Display */}
      {isTracking && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <h4 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2 text-sm">
            <Navigation className="h-4 w-4 text-indigo-500" />
            Rute Perjalanan Real-time
          </h4>
          <LeafletMap coordinates={coordinates} />
        </div>
      )}
    </div>
  );
}
