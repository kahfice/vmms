# VMMS (Vehicle Maintenance Management System)

[![Framework](https://img.shields.io/badge/Framework-Next.js%2015-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/Library-React%2019-blue?style=flat-square&logo=react)](https://react.dev/)
[![PWA](https://img.shields.io/badge/PWA-Supported-orange?style=flat-square&logo=progressive-web-apps)](https://web.dev/explore/progressive-web-apps)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

**VMMS** adalah aplikasi web *Progressive Web App* (PWA) modern yang dirancang untuk mempermudah pencatatan, pemantauan, dan manajemen jadwal servis kendaraan secara otomatis (fokus saat ini pada sepeda motor). Pengguna tidak perlu lagi menghitung secara manual kapan harus melakukan servis, karena sistem akan secara cerdas menghitung estimasi kilometer serta waktu jatuh tempo.

---

## ✨ Fitur Utama (Key Features)

- 📱 **Installable PWA**: Dapat diinstal di perangkat desktop maupun mobile (Android & iOS) layaknya aplikasi native.
- 📺 **Fullscreen Standalone**: Berjalan dalam mode mandiri tanpa address bar browser, memberikan pengalaman pengguna yang bersih dan imersif.
- 📶 **Offline Support**: Aset utama dan halaman penting disimpan di cache lokal untuk memastikan aplikasi tetap dapat diakses meskipun koneksi internet tidak stabil atau offline.
- 📍 **Tracking Kilometer Otomatis**: Pelacakan jarak perjalanan menggunakan **Browser Geolocation API** dengan perhitungan formula Haversine yang langsung diakumulasikan ke odometer kendaraan secara real-time. Bebas biaya karena menggunakan **Leaflet** dan **OpenStreetMap** (tanpa Google Maps API).
- ⏰ **Reminder Servis Cerdas**: Notifikasi dan pengingat servis yang dinamis berdasarkan batas kilometer maupun waktu jatuh tempo servis.
- 📊 **Dashboard & Statistik**: Visualisasi interaktif grafik konsumsi jarak harian/bulanan serta biaya perawatan kendaraan menggunakan diagram yang modern.

---

## 🛠️ Tech Stack

Aplikasi ini dibangun menggunakan teknologi modern:

- **Frontend Core**: [Next.js 15 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Bahasa Pemrograman**: [TypeScript](https://www.typescriptlang.org/)
- **Desain & Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database & ORM**: [PostgreSQL (Supabase)](https://supabase.com/) & [Prisma ORM](https://www.prisma.io/)
- **PWA integration**: [@ducanh2912/next-pwa](https://github.com/ducanhgh/next-pwa)
- **Map & Geolocation**: [Leaflet](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/)
- **Chart & Grafik**: [Recharts](https://recharts.org/)
- **Validasi Skema**: [Zod](https://zod.dev/)

---

## 📂 Struktur Folder (Folder Structure)

Aplikasi ini menggunakan pendekatan **Feature-Based Architecture** untuk memisahkan logika bisnis:

```text
├── prisma/                  # Skema database & file seeding
├── public/                  # Aset statis & file manifest PWA (icons, dll)
└── src/
    ├── app/                 # Next.js app router, tata letak (layouts), & style global
    ├── features/            # Logika dan komponen modular per fitur
    │   ├── history/         # Pencatatan riwayat servis & detail nota belanja
    │   ├── reminders/       # Aturan pengingat & status jatuh tempo servis
    │   ├── statistics/      # Analisis grafik biaya & akumulasi jarak
    │   ├── tracking/        # Modul GPS pelacakan jarak tempuh (real-time)
    │   └── vehicles/        # Manajemen profil & spesifikasi kendaraan
    ├── hooks/               # Custom hooks yang dapat digunakan kembali (e.g., useGeolocationTracking)
    └── lib/                 # Konfigurasi shared client library (e.g., database client)
```

---

## ⚙️ Environment Variables

Salin berkas konfigurasi environment dan sesuaikan URL database Anda:

```bash
# Buat file baru bernama .env di direktori root
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=public"
```

---

## 🚀 Cara Instalasi & Menjalankan Project

### 1. Clone Repositori
```bash
git clone https://github.com/kahfice/vmms.git
cd vmms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database (Prisma)
Generate Prisma Client dan terapkan skema database ke database PostgreSQL Anda:
```bash
# Menghasilkan client Prisma
npx prisma generate

# Sinkronisasi skema ke database
npx prisma db push

# (Opsional) Mengisi data awal ke database
npx prisma db seed
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka browser dan akses [http://localhost:3000](http://localhost:3000).

---

## 📦 Build untuk Production

Untuk melakukan build aplikasi siap rilis:
```bash
npm run build
```

Untuk menjalankan aplikasi hasil build tersebut:
```bash
npm run start
```

---

## 📲 Panduan Instalasi PWA

### 🖥️ Desktop (Chrome / Edge / Safari)
1. Buka aplikasi yang telah dideploy atau berjalan lokal pada browser.
2. Pada address bar sebelah kanan, klik ikon **Install** (biasanya berupa logo komputer dengan panah ke bawah atau tanda tambah).
3. Konfirmasi dengan mengeklik **Install**. Aplikasi akan terbuat pintasannya di desktop dan berjalan di jendela mandiri (*standalone*).

### 🤖 Android (Chrome)
1. Buka browser Chrome di Android, lalu akses alamat website aplikasi.
2. Ketuk ikon menu titik tiga di pojok kanan atas browser.
3. Pilih menu **Tambahkan ke Layar Utama** (*Add to Home Screen*) atau **Instal Aplikasi**.
4. Selesaikan konfirmasi instalasi.

### 🍏 iOS / iPadOS (Safari)
1. Buka Safari di perangkat iOS, lalu akses alamat website aplikasi.
2. Ketuk tombol **Share** (ikon persegi dengan panah ke atas di bagian bawah layar).
3. Gulir ke bawah lalu ketuk pilihan **Add to Home Screen**.
4. Ketuk **Add** di pojok kanan atas untuk menyelesaikan.

---

## 🔔 Pengembangan Mendatang & Fitur Opsional

- 💬 **Push Notifications**: Rencana integrasi Web Push API untuk mengirimkan notifikasi latar belakang (*background service notifications*) saat jadwal servis mendekati batas.
- 🌐 **Live Demo**: [https://vmms-demo.vercel.app](https://vmms-demo.vercel.app) *(Tautan demonstrasi simulasi)*
- ⛽ **Fuel Tracking**: Modul tambahan untuk menganalisis konsumsi rata-rata bahan bakar per kilometer.
