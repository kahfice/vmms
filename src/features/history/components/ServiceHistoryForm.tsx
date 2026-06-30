"use client";

import { useState } from "react";
import { createServiceHistory } from "../actions";
import { Plus, Trash2, Calendar, DollarSign, PenTool } from "lucide-react";

interface ServiceHistoryFormProps {
  vehicleId: string;
  currentOdometer: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

interface ItemField {
  name: string;
  brand: string;
  price: string;
  quantity: number;
  notes: string;
}

export default function ServiceHistoryForm({
  vehicleId,
  currentOdometer,
  onSuccess,
  onCancel,
}: ServiceHistoryFormProps) {
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [odometer, setOdometer] = useState(currentOdometer.toString());
  const [workshopName, setWorkshopName] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState("");

  const [items, setItems] = useState<ItemField[]>([
    { name: "", brand: "", price: "", quantity: 1, notes: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    setItems([...items, { name: "", brand: "", price: "", quantity: 1, notes: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemField, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!odometer || parseFloat(odometer) < 0) {
      setError("Odometer harus diisi dan bernilai positif");
      return;
    }

    const invalidItem = items.some((item) => !item.name.trim());
    if (invalidItem) {
      setError("Nama item servis tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      vehicleId,
      serviceDate,
      odometer: parseFloat(odometer),
      workshopName: workshopName || null,
      notes: notes || null,
      receiptPhoto: receiptPhoto || null,
      items: items.map((item) => ({
        name: item.name,
        brand: item.brand || null,
        price: parseFloat(item.price) || 0,
        quantity: item.quantity,
        notes: item.notes || null,
      })),
    };

    try {
      const res = await createServiceHistory(payload);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Gagal menyimpan riwayat servis");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-3 text-xs text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tanggal Servis *
          </label>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Odometer Saat Servis (km) *
          </label>
          <input
            type="number"
            step="any"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            placeholder="Contoh: 12500"
            className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Nama Bengkel (Opsional)
          </label>
          <input
            type="text"
            value={workshopName}
            onChange={(e) => setWorkshopName(e.target.value)}
            placeholder="Contoh: AHASS Motor"
            className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Foto Nota / Kuitansi (URL Opsional)
          </label>
          <input
            type="text"
            value={receiptPhoto}
            onChange={(e) => setReceiptPhoto(e.target.value)}
            placeholder="Masukkan link gambar kuitansi"
            className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Catatan Tambahan (Opsional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tulis detail keluhan atau servis..."
          rows={2}
          className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
        />
      </div>

      {/* Dynamic Sub-items Form */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Daftar Pembelian Sparepart / Jasa
          </span>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-xs bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 relative"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                    Nama Barang / Jasa *
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    placeholder="Contoh: Oli SPX2"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 px-3 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                    Merek / Tipe
                  </label>
                  <input
                    type="text"
                    value={item.brand}
                    onChange={(e) => handleItemChange(index, "brand", e.target.value)}
                    placeholder="Contoh: AHM Original"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 px-3 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                    Harga Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, "price", e.target.value)}
                    placeholder="Contoh: 55000"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 px-3 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", parseInt(e.target.value) || 1)
                      }
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 px-3 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 mt-4 rounded-lg self-center cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals & Submit */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-sm text-slate-500 dark:text-slate-400">Total Estimasi Biaya:</span>
          <span className="text-xl font-bold text-slate-800 dark:text-white ml-2">
            Rp {calculateTotal().toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-initial border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium py-2 px-4 rounded-lg text-sm transition-colors text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-medium py-2 px-6 rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Riwayat Servis"}
          </button>
        </div>
      </div>
    </form>
  );
}
