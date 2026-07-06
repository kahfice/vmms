"use client";

import { useState } from "react";
import { deleteReminder, ReminderStatus } from "../actions";
import { Plus, Trash2, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import ReminderForm from "./ReminderForm";
import ConfirmModal from "@/components/ConfirmModal";

interface ReminderListProps {
  vehicleId: string;
  reminders: any[];
}

export default function ReminderList({ vehicleId, reminders }: ReminderListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any | null>(null);

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case "OVERDUE":
        return {
          bg: "bg-red-100 dark:bg-red-950/45 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/50",
          label: "Terlambat Servis",
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
        };
      case "DUE":
        return {
          bg: "bg-orange-100 dark:bg-orange-950/45 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/50",
          label: "Jatuh Tempo",
          icon: <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />,
        };
      case "CRITICAL":
        return {
          bg: "bg-amber-100 dark:bg-amber-950/45 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50",
          label: "Segera Servis",
          icon: <Clock className="h-3.5 w-3.5" />,
        };
      case "WARNING":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-950/45 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900/50",
          label: "Perlu Servis",
          icon: <Clock className="h-3.5 w-3.5" />,
        };
      default:
        return {
          bg: "bg-emerald-100 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
          label: "Aman",
          icon: <CheckCircle className="h-3.5 w-3.5" />,
        };
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false);

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeletePending(true);
    const res = await deleteReminder(deletingId, vehicleId);
    setIsDeletePending(false);
    setDeletingId(null);
    if (!res.success) {
      alert(res.error || "Gagal menghapus pengingat");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Jadwal & Pengingat Servis</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Jadwal perawatan yang terpantau otomatis</p>
        </div>
        <button
          onClick={() => {
            setEditingReminder(null);
            setIsAdding(!isAdding);
          }}
          className="bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50 font-medium py-2 px-3 rounded-lg text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {isAdding ? "Batal" : "Tambah Jadwal"}
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-lg">
          <h4 className="font-medium text-slate-800 dark:text-white text-sm mb-3">Buat Pengingat Baru</h4>
          <ReminderForm vehicleId={vehicleId} onSuccess={() => setIsAdding(false)} />
        </div>
      )}

      {editingReminder && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-lg">
          <h4 className="font-medium text-slate-800 dark:text-white text-sm mb-3">Edit Pengingat</h4>
          <ReminderForm
            vehicleId={vehicleId}
            reminder={editingReminder}
            onSuccess={() => setEditingReminder(null)}
            onCancel={() => setEditingReminder(null)}
          />
        </div>
      )}

      {reminders.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada pengingat servis terdaftar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((reminder) => {
            const badge = getStatusBadge(reminder.computedStatus);
            return (
              <div
                key={reminder.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow bg-slate-50/30 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-slate-800 dark:text-white text-base">
                      {reminder.title}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 mt-3">
                    {reminder.intervalKm && (
                      <div className="flex justify-between">
                        <span>Interval Odometer:</span>
                        <span className="font-medium">Setiap {reminder.intervalKm} km</span>
                      </div>
                    )}
                    {reminder.intervalMonths && (
                      <div className="flex justify-between">
                        <span>Interval Waktu:</span>
                        <span className="font-medium">Setiap {reminder.intervalMonths} bulan</span>
                      </div>
                    )}
                    {reminder.lastCompletedKm !== null && (
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Terakhir Servis:</span>
                        <span>
                          {reminder.lastCompletedKm} km
                          {reminder.lastCompletedDate && (
                            <> ({new Date(reminder.lastCompletedDate).toLocaleDateString("id-ID")})</>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-3 flex items-center justify-between">
                  <div className="text-xs">
                    {reminder.remainingKm !== null && reminder.remainingKm !== undefined && (
                      <p
                        className={`font-medium ${
                          reminder.remainingKm <= 0 ? "text-red-500 font-semibold" : "text-slate-500"
                        }`}
                      >
                        {reminder.remainingKm <= 0
                          ? `Jatuh tempo: Lewat ${Math.abs(Math.round(reminder.remainingKm))} km`
                          : `Sisa jarak: ${Math.round(reminder.remainingKm)} km`}
                      </p>
                    )}
                    {reminder.remainingDays !== null && reminder.remainingDays !== undefined && (
                      <p
                        className={`font-medium ${
                          reminder.remainingDays <= 0 ? "text-red-500 font-semibold" : "text-slate-500"
                        }`}
                      >
                        {reminder.remainingDays <= 0
                          ? `Jatuh tempo: Lewat ${Math.abs(reminder.remainingDays)} hari`
                          : `Sisa waktu: ${reminder.remainingDays} hari`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingReminder(reminder)}
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 text-xs font-semibold py-1 px-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Modal Confirm Delete */}
      <ConfirmModal
        isOpen={deletingId !== null}
        title="Hapus Pengingat Servis"
        message="Apakah Anda yakin ingin menghapus pengingat servis ini? Tindakan ini tidak dapat dibatalkan."
        isPending={isDeletePending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
