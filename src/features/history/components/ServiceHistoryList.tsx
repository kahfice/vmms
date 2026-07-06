"use client";

import { useState } from "react";
import { deleteServiceHistory } from "../actions";
import { Plus, Trash2, Calendar, MapPin, DollarSign, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import ServiceHistoryForm from "./ServiceHistoryForm";
import ConfirmModal from "@/components/ConfirmModal";

interface ServiceHistoryListProps {
  vehicleId: string;
  currentOdometer: number;
  histories: any[];
}

export default function ServiceHistoryList({
  vehicleId,
  currentOdometer,
  histories,
}: ServiceHistoryListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedHistoryId(expandedHistoryId === id ? null : id);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeletePending(true);
    const res = await deleteServiceHistory(deletingId, vehicleId);
    setIsDeletePending(false);
    setDeletingId(null);
    if (!res.success) {
      alert(res.error || "Gagal menghapus riwayat servis");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Riwayat Servis Kendaraan</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Catatan perbaikan dan penggantian sparepart</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50 font-medium py-2 px-3 rounded-lg text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {isAdding ? "Batal" : "Catat Servis"}
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-lg">
          <h4 className="font-medium text-slate-800 dark:text-white text-sm mb-3">Catat Riwayat Servis Baru</h4>
          <ServiceHistoryForm
            vehicleId={vehicleId}
            currentOdometer={currentOdometer}
            onSuccess={() => setIsAdding(false)}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {histories.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada riwayat servis terdaftar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {histories.map((history) => {
            const isExpanded = expandedHistoryId === history.id;
            return (
              <div
                key={history.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/10 dark:bg-slate-900/50"
              >
                {/* Header info */}
                <div
                  onClick={() => toggleExpand(history.id)}
                  className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(history.serviceDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700">
                      {history.odometer} km
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Total Biaya</p>
                      <p className="font-bold text-slate-800 dark:text-white">
                        Rp {history.totalCost.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(history.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => toggleExpand(history.id)}
                        className="text-slate-400 dark:text-slate-500 p-2 rounded-lg"
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/10 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {history.workshopName && (
                        <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
                          <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-slate-400 block text-xs">BENGKEL</span>
                            {history.workshopName}
                          </div>
                        </div>
                      )}
                      {history.notes && (
                        <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-slate-400 block text-xs shrink-0 mt-0.5">CATATAN:</span>
                          <p>{history.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Service Items Table */}
                    <div>
                      <span className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                        Rincian Item Servis
                      </span>
                      <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800/80">
                        <table className="w-full text-left text-xs border-collapse bg-white dark:bg-slate-900">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                              <th className="py-2.5 px-3">Item</th>
                              <th className="py-2.5 px-3">Merek</th>
                              <th className="py-2.5 px-3 text-right">Harga</th>
                              <th className="py-2.5 px-3 text-center">Qty</th>
                              <th className="py-2.5 px-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            {history.items.map((item: any) => (
                              <tr key={item.id}>
                                <td className="py-2 px-3 font-medium">{item.name}</td>
                                <td className="py-2 px-3 text-slate-500">{item.brand || "-"}</td>
                                <td className="py-2 px-3 text-right">
                                  Rp {item.price.toLocaleString("id-ID")}
                                </td>
                                <td className="py-2 px-3 text-center">{item.quantity}</td>
                                <td className="py-2 px-3 text-right font-semibold">
                                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Receipt Photo */}
                    {history.receiptPhoto && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                          Foto Nota / Kuitansi
                        </span>
                        <div className="relative max-w-[200px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                          <img
                            src={history.receiptPhoto}
                            alt="Receipt"
                            className="w-full h-auto object-cover max-h-[200px]"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <a
                            href={history.receiptPhoto}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 justify-center transition-colors border-t border-slate-200"
                          >
                            <ImageIcon className="h-4.5 w-4.5" />
                            Lihat Foto Nota
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Modal Confirm Delete */}
      <ConfirmModal
        isOpen={deletingId !== null}
        title="Hapus Catatan Servis"
        message="Apakah Anda yakin ingin menghapus catatan servis ini? Odometer kendaraan mungkin akan disesuaikan secara otomatis. Tindakan ini tidak dapat dibatalkan."
        isPending={isDeletePending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
