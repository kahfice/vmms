# Vehicle Maintenance Management System (VMMS)

## Deskripsi Proyek

VMMS adalah aplikasi web Progressive Web App (PWA) untuk membantu pengguna mencatat, memonitor, dan mengingat jadwal servis kendaraan, khususnya sepeda motor. Sistem dirancang agar pengguna tidak perlu lagi menghitung sendiri kapan harus melakukan servis berdasarkan kilometer maupun waktu.

Aplikasi harus memiliki tampilan modern, responsif, mudah digunakan, dan dapat berjalan dengan baik di desktop maupun perangkat mobile.

---

# Tujuan Utama

Membuat aplikasi yang mampu:

- Mencatat data kendaraan.
- Mencatat riwayat servis.
- Menghitung estimasi kilometer kendaraan secara otomatis.
- Memberikan reminder servis berdasarkan kilometer maupun tanggal.
- Menampilkan statistik penggunaan kendaraan.
- Menjadi aplikasi yang dapat dikembangkan untuk mendukung berbagai jenis kendaraan di masa depan.

---

# Fitur Utama

## 1. Manajemen Kendaraan

Pengguna dapat:

- Menambah kendaraan.
- Mengubah data kendaraan.
- Menghapus kendaraan.
- Mengelola beberapa kendaraan dalam satu akun.

---

## 2. Tracking Kilometer Otomatis

Aplikasi memiliki fitur pelacakan perjalanan menggunakan Browser Geolocation API.

Tracking hanya berjalan ketika pengguna menekan tombol **Start Tracking** dan berhenti ketika tombol **Stop Tracking** ditekan.

Jarak dihitung menggunakan algoritma Haversine, kemudian otomatis menambah odometer kendaraan.

Tracking dapat diaktifkan atau dinonaktifkan melalui tombol ON/OFF agar perjalanan yang tidak menggunakan kendaraan tidak ikut dihitung.

Google Maps API tidak digunakan. Gunakan Browser Geolocation API, OpenStreetMap, dan Leaflet agar aplikasi tetap gratis.

---

## 3. Reminder Servis

Pengguna dapat membuat interval servis berdasarkan:

- Kilometer
- Waktu (bulan/tanggal)

Contoh:

- Ganti oli setiap 2.500 km
- Kampas rem setiap 10.000 km
- Servis CVT setiap 8.000 km

Sistem akan memberikan notifikasi otomatis, misalnya:

- 200 km sebelum jatuh tempo
- 100 km sebelum jatuh tempo
- Tepat saat jatuh tempo
- Terlambat servis

---

## 4. Riwayat Servis

Pengguna dapat mencatat:

- Tanggal servis
- Kilometer saat servis
- Nama bengkel
- Catatan
- Total biaya

Setiap servis dapat memiliki beberapa item, misalnya:

- Oli Shell Advance Ultra
- Kampas Rem Original
- Filter Udara
- Roller CVT

Setiap item memiliki:

- Nama
- Merek
- Harga
- Jumlah
- Catatan

Pengguna juga dapat mengunggah foto nota servis.

---

## 5. Dashboard

Dashboard menampilkan informasi penting seperti:

- Kendaraan aktif
- Odometer saat ini
- Servis berikutnya
- Reminder aktif
- Riwayat servis terbaru
- Jarak hari ini
- Total biaya bulan ini

---

## 6. Statistik

Menampilkan grafik:

- Kilometer harian
- Kilometer bulanan
- Biaya servis
- Pengeluaran kendaraan
- Frekuensi servis

---

## 7. Pengaturan

Pengguna dapat mengatur:

- Tema Light/Dark
- Notifikasi
- Tracking GPS
- Interval reminder
- Satuan kilometer

---

# Teknologi

Gunakan teknologi berikut:

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma ORM
- PostgreSQL (Supabase)
- Browser Geolocation API
- OpenStreetMap
- Leaflet
- Progressive Web App (PWA)

---

# Standar Pengembangan

Saat mengembangkan aplikasi:

- Gunakan Feature-Based Architecture.
- Gunakan Server Components sebagai default.
- Gunakan Server Actions untuk CRUD.
- Gunakan Prisma ORM untuk akses database.
- Gunakan Zod untuk validasi.
- Gunakan TypeScript Strict Mode.
- Buat komponen yang reusable.
- Gunakan Clean Architecture.
- Optimalkan performa dan responsivitas.

---

# Target Akhir

Aplikasi harus memiliki kualitas production-ready dengan kode yang bersih, modular, mudah dikembangkan, aman, dan memiliki UI modern. Seluruh implementasi harus konsisten dengan tujuan utama aplikasi serta mudah dikembangkan untuk penambahan fitur baru di masa mendatang seperti Fuel Tracking, AI Recommendation, OBD-II Integration, dan Workshop Management.