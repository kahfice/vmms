"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteVehicle } from "../actions";
import { Plus, Edit2, Trash2, Bike, Car, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import VehicleForm from "./VehicleForm";

interface VehicleSelectorProps {
  vehicles: any[];
  activeVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
}

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
}

export default function VehicleSelector({
  vehicles,
  activeVehicleId,
  onSelectVehicle,
}: VehicleSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  const handleSelect = (id: string) => {
    onSelectVehicle(id);
    setIsOpen(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Apakah Anda yakin ingin menghapus kendaraan ini beserta seluruh datanya?")) {
      const res = await deleteVehicle(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Gagal menghapus kendaraan");
      }
    }
  };

  const handleEdit = (vehicle: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVehicle(vehicle);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Selector Button */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 py-2.5 px-4 rounded-xl shadow-sm text-sm font-semibold flex items-center justify-between text-slate-800 dark:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {activeVehicle?.type === "CAR" ? (
              <Car className="h-5 w-5 text-indigo-500" />
            ) : (
              <Bike className="h-5 w-5 text-indigo-500" />
            )}
            <div className="text-left">
              <span className="block font-bold">{activeVehicle?.name || "Pilih Kendaraan"}</span>
              {activeVehicle?.licensePlate && (
                <span className="block text-xs font-medium text-slate-400">
                  {activeVehicle.licensePlate}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <button
          onClick={() => {
            setEditingVehicle(null);
            setIsAdding(!isAdding);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-3 rounded-xl shadow-sm flex items-center justify-center transition-colors cursor-pointer"
          title="Tambah Kendaraan"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 left-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          <div className="py-1">
            <span className="block px-4 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Daftar Kendaraan Anda
            </span>
            {vehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => handleSelect(v.id)}
                className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                  v.id === activeVehicleId ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {v.type === "CAR" ? (
                    <Car className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  ) : (
                    <Bike className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-white">
                      {v.name}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Odometer: {v.currentOdometer} km
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleEdit(v, e)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {vehicles.length > 1 && (
                    <button
                      onClick={(e) => handleDelete(v.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add */}
      {isAdding && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">
                Tambah Kendaraan Baru
              </h3>
              <VehicleForm
                onSuccess={() => {
                  setIsAdding(false);
                  router.refresh();
                }}
                onCancel={() => setIsAdding(false)}
              />
            </div>
          </div>
        </Portal>
      )}

      {/* Modal Edit */}
      {editingVehicle && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">
                Edit Data Kendaraan
              </h3>
              <VehicleForm
                vehicle={editingVehicle}
                onSuccess={() => {
                  setEditingVehicle(null);
                  router.refresh();
                }}
                onCancel={() => setEditingVehicle(null)}
              />
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
