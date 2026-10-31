# Product Requirements Document (PRD)
## Omni Dashboard Web Application

**Target Audience:** AI Agent / Full-Stack Engineer  
**Project Name:** `omni-app`  
**Version:** 1.0.0  
**Status:** Ready for Implementation  
**Created Date:** 2026-10-18  

---

## 1. Executive Summary & Vision

Aplikasi **Omni Dashboard** adalah platform dashboard omni-channel modern yang dirancang untuk memantau, mengelola gudang dan pesanan, dan menganalisis pesanan dari berbagai kanal (seperti Marketplace Shopee, tiktok, Offline dan sistem CRM) dalam satu antarmuka terpadu.

Dokumen ini berfungsi sebagai panduan spesifikasi teknis dan implementasi utama bagi **AI Agent** yang bertugas membangun sistem dari awal dengan standar kode bersih (*Clean Code*), modular (*DRY - Don't Repeat Yourself*), berkinerja tinggi, dan menggunakan dokumentasi resmi terbaru.

---

## 2. Tech Stack & Dependencies

| Layer | Teknologi | Spesifikasi & Catatan |
| :--- | :--- | :--- |
| **Runtime & Package Manager** | Bun | Runtime JavaScript/TypeScript performa tinggi & package manager utama (`bun install`, `bun run dev`, `bun x`) |
| **Framework** | SvelteKit | Versi terbaru (Svelte 5 Runes: `$state`, `$derived`, `$props`) |
| **Language** | TypeScript | Strict type checking (`strict: true`) |
| **CSS & Styling** | Tailwind CSS | Utility-first styling dengan konfigurasi custom design tokens |
| **UI Component Library** | `shadcn-svelte` | Berbasis Bits UI & Tailwind CSS, headless & accessible. Dashboard Shell menggunakan template resmi **`sidebar-07`** (`bun x shadcn-svelte@latest add sidebar-07`) |
| **Icons** | `lucide-svelte` / `@lucide/svelte` | Icon pack konsisten dan ringan |
| **Theming** | `mode-watcher` | Light/Dark mode detection & toggle tanpa layout shift |
| **Internationalization (i18n)** | Custom Svelte 5 Runes Store | Tipe-aman (typesafe), Default: **English (en)**, Sekunder: **Indonesian (id)** |
| **State Management** | Svelte 5 Runes (`$state`, `$derived`) | Reusable state module terisolasi |
| **Fonts** | Google Fonts | **Poppins** (Headlines) & **Geist Sans** (Body & Labels) |

---

## 3. Design System & Theming

### 3.1 Color Palette
Aplikasi memiliki tema Light Mode dan Dark Mode dengan palet warna khusus sesuai spesifikasi berikut:

- **Light Mode:**
  - `background`: `#F8FAFD` (Soft Cool White / Canvas)
  - `foreground`: `#0F172A` (Slate 900)
  - `card`: `#FFFFFF`
  - `card-foreground`: `#0F172A`
  - `border`: `#E2E8F0` (Slate 200)
  - `muted`: `#F1F5F9`
  - `muted-foreground`: `#64748B` (Slate 500)
  - `primary`: `#2563EB` (Blue 600)
  - `primary-foreground`: `#FFFFFF`

- **Dark Mode:**
  - `background`: `#0F172A` (Deep Slate / Navy)
  - `foreground`: `#F8FAFC` (Slate 50)
  - `card`: `#1E293B` (Slate 800)
  - `card-foreground`: `#F8FAFC`
  - `border`: `#334155` (Slate 700)
  - `muted`: `#1E293B`
  - `muted-foreground`: `#94A3B8` (Slate 400)
  - `primary`: `#3B82F6` (Blue 500)
  - `primary-foreground`: `#0F172A`

### 3.2 Typography Tokens
- **Headline Font (`font-heading`):** `Poppins, sans-serif`
  - Digunakan untuk: H1-H6, Card Titles, Dialog Titles, Modal Headings, KPI Metric Numbers.
  - Weights: `500` (Medium), `600` (SemiBold), `700` (Bold).
- **Body & Label Font (`font-sans`):** `Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Digunakan untuk: Paragraph text, Table cells, Input fields, Badges, Tooltips, Navigation links, Button labels.
  - Weights: `400` (Regular), `500` (Medium).

### 3.3 Responsive Breakpoints
Desain harus adaptif secara fluid pada:
- **Mobile (< 768px):** Hamburger drawer navigation, single-column dashboard cards, horizontal scrollable tables, swipeable tabs.
- **Tablet (768px - 1023px):** Collapsible compact sidebar / bottom bar, 2-column grid layout.
- **Desktop (>= 1024px):** Fixed or expandable full sidebar, multi-column dashboard grid (3-4 columns), full data tables.

---

## 4. Internationalization (i18n) Architecture

- **Default Language:** English (`en`)
- **Secondary Language:** Indonesian (`id`)
- **Struktur File Lokalisasi:**
  - `src/lib/i18n/locales/en.json` (Sumber utama string bahasa Inggris)
  - `src/lib/i18n/locales/id.json` (Terjemahan bahasa Indonesia)
- **Persistensi:** Bahasa tersimpan di `localStorage` dan Cookie agar konsisten saat refresh dan SSR.
- **Fitur Pengalih Bahasa:** Dropdown Switcher (Icon Globe) di header dengan bendera/kode `EN` dan `ID`.

---

## 5. Reusable Component Guidelines (DRY & Clean Code)

Untuk mematuhi prinsip **DRY (Don't Repeat Yourself)** dan **Clean Architecture**, patuhi aturan komponen berikut:

1. **Atomic & Reusable Core Components (`src/lib/components/ui/`):**
   - Komponen dasar diambil/di-generate melalui `shadcn-svelte` (Button, Input, Card, Badge, Dialog, DropdownMenu, Avatar, Table, Tooltip, Sheet, Skeleton).
   - Jangan menduplikasi styling tombol atau input di berbagai halaman. Selalu bungkus dalam variant shadcn.

2. **Composite / Shared Components (`src/lib/components/` & `src/lib/components/common/`):**
   - **Dashboard Shell Foundation (`sidebar-07`):**
     - Diinstal menggunakan perintah instalasi resmi:
       ```bash
       bun x shadcn-svelte@latest add sidebar-07
       ```
     - Terdiri dari komponen block modular:
       - `app-sidebar.svelte`: Sidebar utama yang menampung application brand header (`Sidebar.Header` dengan icon `GalleryVerticalEnd`, nama brand, dan versi), grup menu navigasi kanal, serta profil pengguna. (Catatan: `team-switcher` ditiadakan demi arsitektur dashboard yang ringkas dan terfokus).
       - `nav-main.svelte`: Navigasi link hirarkis dengan icon dan state aktif.
       - `nav-user.svelte`: Profil pengguna di bagian bawah sidebar dengan dropdown menu.
     - *Prinsip Adaptasi:* Template `sidebar-07` dijadikan pondasi awal dan akan disesuaikan secara bertahap seiring berjalannya aplikasi (menghubungkan ke routing SvelteKit, i18n switcher, badge notifikasi real-time, dan kanal Omni).
   - `Header.svelte`: Navigasi atas yang menyatukan `SidebarTrigger`, `Breadcrumb`, Global Search bar, Theme Toggle (Light/Dark), dan Language Switcher (EN/ID).
   - `MetricCard.svelte`: Komponen kartu statistik seragam (Title, Value, Change %, Icon, Trend Chart Sparkline).
   - `DataTable.svelte`: Wrapper tabel dengan pagination, sorting, search filter, dan empty state terpadu.
   - `EmptyState.svelte`: Tampilan konsisten saat tidak ada data.

3. **Clean Code, Strict TypeScript & Svelte 5 Conventions:**
   - **Aturan Ketat TypeScript (Zero `any` & Dilarang Mematikan Linter):**
     - **Dilarang keras menggunakan tipe data `any`** di seluruh berkas proyek (`.ts`, `.svelte`).
     - Gunakan `Component` (dari `svelte`) untuk props Icon atau Komponen dinamis: `icon?: Component` atau `icon?: Component<{ class?: string }>`.
     - Gunakan `unknown` atau generic types yang aman bila menangani data dinamis/bercabang (seperti dictionary i18n atau generic record), disertai type narrowing dan casting aman (`(current as Record<string, unknown>)[key]`).
     - Pada snippet props (seperti child snippet Bits UI / shadcn-svelte), gunakan inferensi alami Svelte 5 `{#snippet child({ props })}` tanpa memaksakan anotasi `Record<string, any>`.
     - **Dilarang keras mematikan linter atau compiler warning menggunakan komentar `eslint-disable`** (seperti `// eslint-disable-next-line @typescript-eslint/no-explicit-any`). Semua isu tipe data harus diselesaikan secara arsitektural dan tepat guna.
   - **Gunakan Svelte 5 Runes:**
     - Gantilah `let x` reaktif dengan `$state(initialValue)`.
     - Gantilah `$:` dengan `$derived(expression)`.
     - Gunakan `$props()` untuk deklarasi props komponen dengan type TypeScript yang ketat.
   - Ekstraksi helper logika ke `src/lib/utils/` (formatting angka, mata uang, tanggal, channel mapper).
   - Hindari inline style dan magic strings; gunakan typed constants.

---

## 6. Functional Specifications & Modules

Aplikasi Omni Dashboard mencakup modul-modul berikut:

### 6.1 Layout & Navigation Shell (Berbasis `sidebar-07`)
Pondasi layout dashboard dibangun di atas blok **`sidebar-07`** dari `shadcn-svelte` dan disesuaikan seiring perkembangan aplikasi:
- **Sidebar Header (Branding Header):**
  - Menggunakan komponen header branding resmi dengan icon container (`GalleryVerticalEndIcon`), nama aplikasi (**Cronsyst**), dan badge versi (**v1.0.0**) yang terhubung langsung ke root dashboard (`/`).
  - Menggantikan team switcher dengan branding header yang elegan, minimalis, dan selaras dengan tema aplikasi.
- **Sidebar Navigation (`nav-main` & nav groups):**
  - Navigasi menu utama:
    - *Product* (Manage Product: `/product/manage`, Categories: `/product/categories`, Merk: `/product/merk`)
    - *Inventory* (Warehouse: `/inventory/warehouse`, Stock Transfer: `/inventory/stock-transfer`, Stock Opname: `/inventory/stock-opname`)
    - *Point Of Sale* (Transaction: `/pos/transaction`, Setting: `/pos/setting`)
    - *User* (Manage User: `/user/manage`)
    - *Settings* (General: `/settings/general`, Account: `/settings/account`, Notification: `/settings/notifications`)
  - Fitur collapsible sub-menu dan status link aktif berbasis URL SvelteKit.
- **Sidebar Footer (`nav-user`):**
  - Info pengguna (Avatar, Nama, Email/Role).
  - Popover / Dropdown Menu: Profil, Pengaturan Akun, dan Logout.
- **Top Header Bar:** 
  - `SidebarTrigger` (tombol expand/collapse sidebar desktop & mobile).
  - Separator & Dynamic breadcrumbs berdasarkan rute aktif (`/inventory/*`, `/settings/*`, dll).
  - Global Search bar (shortcut `Cmd+K` / `Ctrl+K`).
  - Language Switcher (EN / ID dropdown).
  - Theme Toggle (Light `#F8FAFD` / Dark `#0F172A`).
  - Notification Bell popover dengan unread counter.

### 6.2 Module 1: Overview (Dashboard Utama)
- **KPI Summary Grid (4 Kartu Utama):**
  - Revenue (dengan trend perbandingan minggu lalu).
  - Orders (misal: "1,450 Orders", trend performa).
  - Products Sold (jumlah unit produk yang berhasil terjual).
  - Cancelled (jumlah atau persentase pesanan yang dibatalkan).
- **Omni Activity Chart:**
  - Visualisasi grafik pesanan (offline & online) masuk dalam rentang waktu (7 hari / 30 hari).
- **Recent Omnichannel Transaction Table:**
  - Daftar transaction terbaru: Invoice Number, Channel Icon, Amount, Timestamp, Status (Selesai, Pending, Cancelled).
- **Quick Action Bar:**
  - "Broadcast Message", "Connect New Channel", "Export Report".

### 6.3 Module 2: Settings & Localization
- Preferensi Bahasa: Radio selection atau select option [English (Default), Bahasa Indonesia].
- Preferensi Tema: Light Mode, Dark Mode, atau System.
- Notifikasi: Email, Sound, Desktop Push toggle.

### 6.4 Module 3: Warehouse Management System (WMS)
Modul Warehouse mengelola infrastruktur pergudangan, pergerakan barang antar fasilitas, serta audit kesesuaian stok fisik secara berkala. Terdiri dari 3 sub-halaman mandiri (*dedicated pages*):

#### 6.4.1 Sub-Module: Warehouse (`/inventory/warehouse`)
- **Tujuan:** Manajemen data induk fasilitas penyimpanan, inventarisasi kapasitas produk terdaftar, dan penugasan manajer operasional gudang.
- **Header & Action Bar:**
  - Layout: `justify-between items-center`
  - Konten: Judul modul (*Manage Warehouse / Kelola Gudang*) dan Sub-judul (*kegunaan/deskripsi operasional*).
  - Tombol Utama: `+ Create Warehouse / Tambah Gudang` (Membuka modal input data gudang baru).
- **Search Bar:**
  - Ukuran: Full width (`w-full`).
  - Parameter Pencarian: Live filter berdasarkan nama Gudang atau nama Manager.
- **Spesifikasi Tabel Data:**
  - `Warehouse`: Nama gudang fasilitas dan lokasi hub (contoh: *Gudang A - Jakarta Pusat*).
  - `Products`: Total kuantitas produk SKU terdaftar (contoh: *12*).
  - `Manager`: Nama penanggung jawab operasional (contoh: *Yono*).
  - `CreatedAt`: Tanggal registrasi/pembuatan gudang (format `DD/MM/YYYY`, contoh: *18/02/2026*). Kolom ini memiliki indikator sortable (Ascending / Descending) pada table header.
  - `Actions`: Tombol ikon aksi more (`EllipsisVerticalIcon`) dengan dropdown menu:
    - **Detail:** Membuka pop-up modal detail spesifikasi gudang.
    - **Copy:** Menyalin data ringkasan gudang ke clipboard.
    - **Edit:** Membuka modal formulir perbaruan gudang.
    - **Delete:** Menghapus data gudang dari sistem dengan konfirmasi.

#### 6.4.2 Sub-Module: Stock Transfer (`/inventory/stock-transfer`)
- **Tujuan:** Pelacakan, otorisasi, dan pencatatan perpindahan/mutasi stok barang antar lokasi fasilitas gudang.
- **Header & Action Bar:**
  - Layout: `justify-between items-center`
  - Konten: Judul modul (*Stock Transfer / Transfer Stok*) dan Sub-judul.
  - Tombol Utama: `+ Create Transfer / Buat Transfer` (Membuka modal formulir transfer stok baru).
- **Search & Filter Controls:**
  - Ukuran: Full width (`w-full`).
  - Komponen:
    - Search input (pencarian berdasarkan kode transfer atau nama warehouse manager/origin/destination).
    - Filter dropdown berdasarkan Gudang (*All Warehouses / Gudang A / Gudang B / Gudang C*).
    - Filter dropdown berdasarkan Status (*All Status / Success / Pending / Cancelled*).
    - Tombol Reset: Mereset seluruh input pencarian dan filter ke konfigurasi default.
- **Spesifikasi Tabel Data:**
  - `Code Transfer`: Kode unik mutasi pengiriman (contoh: *TRF-20261019-2111*).
  - `Date`: Tanggal pelaksanaan transfer (format `DD/MM/YYYY`, contoh: *18/10/2026*). Kolom ini memiliki indikator sortable (Ascending / Descending) pada table header.
  - `Origin`: Fasilitas gudang asal pengirim (contoh: *Gudang A*).
  - `Destination`: Fasilitas gudang tujuan penerima (contoh: *Gudang B*).
  - `Products`: Kuantitas unit produk yang ditransfer (contoh: *82*).
  - `Status`: Status transfer barang dengan badge indikator:
    - `Success` (Hijau/Emerald)
    - `Pending` (Kuning/Amber)
    - `Cancelled` (Merah/Rose)
  - `Actions`: Tombol ikon aksi more (`EllipsisVerticalIcon`) dengan dropdown menu:
    - **Detail:** Membuka modal informasi lengkap transfer order.
    - **Accept:** Mengotorisasi pengiriman dan mengubah status menjadi *Success*.
    - **Reject:** Menolak dan membatalkan mutasi stok menjadi *Cancelled*.
    - **Edit:** Mengubah detail transfer (asal/tujuan/jumlah).
    - **Delete:** Menghapus pencatatan transfer.

#### 6.4.3 Sub-Module: Stock Opname (`/inventory/stock-opname`)
- **Tujuan:** Verifikasi dan rekonsiliasi berkala kesesuaian fisik stok barang di gudang dengan catatan digital pada sistem.
- **Header & Action Bar:**
  - Layout: `justify-between items-center`
  - Konten: Judul modul (*Stock Opname / Stok Opname*) dan Sub-judul.
  - Tombol Utama: `+ Create Stock Opname / Buat Stok Opname` (Membuka modal pencatatan opname).
- **Search & Filter Controls:**
  - Ukuran: Full width (`w-full`).
  - Komponen:
    - Search input (pencarian berdasarkan kode audit, nama gudang, atau nama petugas recorder).
    - Filter dropdown berdasarkan Gudang (*All Warehouses / Gudang A / Gudang B / Gudang C*).
    - Filter dropdown berdasarkan Status (*All Status / Completed / Draft*).
    - Tombol Reset: Mengembalikan seluruh filter ke kondisi semula.
- **Spesifikasi Tabel Data:**
  - `Code`: Kode unik audit stock opname (contoh: *OP-2993420-123*).
  - `Date`: Tanggal pelaksanaan audit opname (format `DD/MM/YYYY`, contoh: *18/05/2026*). Kolom ini memiliki indikator sortable (Ascending / Descending) pada table header.
  - `Warehouse`: Lokasi gudang tempat opname dilakukan (contoh: *Gudang A*).
  - `Products`: Jumlah varian produk terverifikasi, **wajib menggunakan komponen Badge** (contoh: *120 Variant*).
  - `Recorder`: Nama petugas/pencatat opname di lapangan (contoh: *Yono Bakrie*).
  - `Status`: Status penyelesaian audit dengan badge (*Completed*, *Draft*).
  - `Actions`: Tombol ikon aksi more (`EllipsisVerticalIcon`) dengan dropdown menu:
    - **Detail:** Menampilkan rincian hasil pencocokan fisik audit.
    - **Edit:** Memperbarui data varian atau catatan petugas.
    - **Delete:** Menghapus rekaman hasil audit stock opname.

### 6.5 Module 4: User Management System (`/user/manage`)
Modul User Management bertugas mengelola hak akses akun pengguna, penetapan peran (role), serta aktivasi/deaktivasi akun operasional dalam sistem.

#### 6.5.1 Sub-Module: Manage User (`/user/manage`)
- **Tujuan:** Manajemen akun personil sistem, penugasan level akses, aktivasi status kerja, dan pemeliharaan kredensial keamanan akun.
- **Menu Hirarki:** `User` (menu utama) -> `Manage User` (sub menu, path: `/user/manage`).
- **Header & Action Bar:**
  - Layout: `justify-between items-center`
  - Konten: Judul modul (*Manage User / Kelola Pengguna*) dan Sub-judul (*kegunaan/deskripsi manajemen peran pengguna*).
  - Tombol Utama: `+ Create User / Tambah Pengguna` (Membuka modal formulir registrasi pengguna baru dengan warna primary dan teks putih).
- **Search & Filter Controls:**
  - Ukuran: Full width (`w-full`) responsif (`flex flex-col gap-3 lg:flex-row lg:items-center`).
  - Komponen:
    - Search input: Pencarian spesifik berdasarkan kolom `name` (contoh: *Yono Bakrie*), dilengkapi clear icon (`XIcon`).
    - Filter dropdown: Filter berdasarkan `role` (*All Roles*, *Super Admin*, *Admin*, *Warehouse Manager*, *Inventory Staff*, *Cashier*).
    - Tombol Reset: Mengembalikan input pencarian nama, filter role, serta sort state ke kondisi awal.
- **Spesifikasi Tabel Data:**
  - `name`: Nama lengkap pengguna dengan avatar/inisial nama (contoh: *Yono Bakrie*). Kolom ini memiliki indikator sortable (Ascending / Descending) pada table header.
  - `email`: Alamat email resmi pengguna (contoh: *example@cronsyst.com*).
  - `role`: Peran otorisasi dengan badge visual (contoh: *Super Admin*, *Admin*, *Warehouse Manager*, *Inventory Staff*, *Cashier*).
  - `status`: Komponen interaktif **Switch Button** (*Active / Disable*) yang dapat langsung di-toggle statusnya di dalam tabel dengan feedback visual dan toast notification.
  - `CreatedAt`: Tanggal pembuatan/registrasi akun (format `DD/MM/YYYY`, contoh: *18/02/2026*). Kolom ini memiliki indikator sortable (Ascending / Descending) pada table header.
  - `Actions`: Tombol ikon aksi more (`EllipsisVerticalIcon`) dengan dropdown menu:
    - **Detail:** Membuka pop-up modal profil dan spesifikasi hak akses pengguna.
    - **Edit:** Membuka modal formulir perbaruan profil, role, dan nomor kontak pengguna.
    - **Reset Password:** Membuka modal atur ulang kata sandi dengan fitur generator password acak, tombol salin ke clipboard, serta simpan kredensial.
    - **Delete:** Membuka dialog konfirmasi penghapusan pengguna (`ConfirmDialog`).
- **Spesifikasi Sorting:**
  - Header kolom yang mendukung sorting: **Name** dan **CreatedAt**.
- **Spesifikasi Pagination:**
  - **Minimum Per Page adalah 10** (`perPage = 10`).
  - Opsi pilihan pagination: `10, 20, 50, 100`.

### 6.6 Module 5: Product Management System (`/product`)
Modul Product mengelola katalog produk omni-channel, varian produk terperinci, kategori retail terstandarisasi, dan manajemen brand/merk produsen.

#### 6.6.1 Sub-Module: Manage Product (`/product/manage`)
- **Tujuan:** Manajemen katalog barang master, pemantauan ketersediaan stok fisik gudang, kontrol status aktivasi penjualan, serta ekspansi sub-tabel varian produk secara dinamis.
- **Menu Hirarki:** `Product` (menu utama) -> `Manage Product` (sub menu, path: `/product/manage`).
- **Header & Action Bar:**
  - Layout: `justify-between items-center`
  - Konten: Judul modul (*Manage Product / Kelola Produk*) dan Sub-judul (*kegunaan/deskripsi katalog produk omni-channel*).
  - Tombol Utama: `+ Create Product / Tambah Produk`. **Catatan Penting:** Tombol create mengarah langsung ke page dedicated `/product/manage/create` (bukan dialog modal).
- **Search & Filter Controls:**
  - Ukuran: Full width (`w-full`) responsif.
  - Komponen:
    - Search input: Live filter berdasarkan kolom `name` dan `sku` dengan clear icon (`XIcon`).
    - Filter dropdown Category: Filter berdasarkan kategori (*All Categories*, *Gadget & Elektronik*, *Audio & Wearables*, *Fashion & Footwear*, *Komputer & Aksesoris*, *Home Appliances*).
    - Filter dropdown Merk: Filter berdasarkan merk/brand (*All Merk*, *Apple*, *Samsung*, *Sony*, *Nike*, *Logitech*, *Asus*, dll).
    - Filter dropdown Gudang: Filter berdasarkan fasilitas penyimpanan (*All Warehouses*, *Gudang A*, *Gudang B*, *Gudang C*, *Gudang D*).
    - Tombol Reset: Mereset seluruh parameter pencarian, filter dropdown, dan pagination ke nilai awal.
- **Spesifikasi Tabel Data:**
  - `checkbox`: Checkbox seleksi baris untuk operasi massal (*Bulk Delete*), dilengkapi select-all di table header.
  - `product`: Kolom gabungan berisi:
    - Tombol chevron expand/collapse untuk membuka daftar varian.
    - Thumbnail gambar produk beresolusi tinggi dengan container rounded border.
    - Nama produk lengkap (contoh: *Apple iPhone 15 Pro Max*).
    - Kode unik SKU produk (contoh: *APL-IP15PM*).
    - Badge counter jumlah varian (contoh: *3 Varian*).
  - `stok`: Kuantitas total stok produk dalam bentuk numeral terformat (contoh: *100 unit*).
  - `status`: Komponen interaktif **Switch Button** (*Active / Disable*) yang dapat langsung di-toggle statusnya dengan feedback visual dan toast notification.
  - `CreatedAt`: Tanggal pembuatan data (format `DD/MM/YYYY`, contoh: *18/02/2026*). Kolom ini memiliki indikator sortable (Ascending / Descending) pada table header.
  - `Actions`: Tombol ikon aksi more (`EllipsisVerticalIcon`) dengan dropdown menu:
    - **Detail:** Membuka pop-up modal spesifikasi katalog, harga, status, dan rincian varian.
    - **Edit:** Membuka formulir modal perbaruan data nama, SKU, kategori, merk, stok, dan alokasi gudang.
    - **Delete:** Menghapus data produk dengan dialog konfirmasi (`ConfirmDialog`).
- **Spesifikasi Collapsible Rows (Varian Produk):**
  - Setiap baris produk dilengkapi tombol toggle collapsible (`ChevronRightIcon` / `ChevronDownIcon`).
  - Saat di-expand, menampilkan nested sub-table yang memuat rincian variasi produk: Nama Varian (contoh: *Natural Titanium - 256GB*), SKU Varian (*APL-IP15PM-NT-256*), Harga (format Rupiah), Kuantitas Stok, dan Badge Status (*Active / Disable*).
- **Spesifikasi Sorting:**
  - Header kolom yang mendukung sorting: **Name** dan **CreatedAt**.
- **Spesifikasi Pagination:**
  - **Minimum Per Page adalah 10** (`perPage = 10`).
  - Opsi pilihan pagination: `10, 20, 50, 100`.

#### 6.6.2 Dedicated Page: Create Product (`/product/manage/create`)
- **Tujuan:** Halaman formulir mandiri untuk registrasi produk baru ke dalam katalog sistem.
- **Navigasi:** Tombol kembali (*Back button*) ke rute `/product/manage` dan breadcrumb dinamis (*Product -> Manage Product -> Create Product*).
- **Struktur Formulir:**
  - Informasi Umum: Nama Produk, SKU Produk, Kategori, Merk, Harga Dasar.
  - Alokasi Gudang & Inventaris: Pemilihan Gudang Utama, Stok Awal, dan Switch Status Produk (*Active / Disable*).
  - Builder Varian Produk: Fitur penambahan variasi dinamis (Nama Varian, SKU Varian, Harga, Stok) dengan tombol hapus varian per baris.
  - Gambar Produk: Preview gambar interaktif, input URL gambar, dan selector preset gambar cepat (Smartphone, Headphones, Sneakers, Laptop).
  - Ringkasan Katalog: Card ringkasan data sebelum disimpan dan tombol submit *Save Product*.

#### 6.6.3 Sub-Module: Categories (`/product/categories`)
- **Tujuan:** Manajemen kategori retail untuk pengelompokan produk secara terstruktur dengan standarisasi kode prefix 3 huruf.
- **Menu Hirarki:** `Product` (menu utama) -> `Categories` (sub menu, path: `/product/categories`).
- **Header & Action Bar:**
  - Layout: `justify-between items-center`
  - Konten: Judul modul (*Categories / Kategori*) dan Sub-judul.
  - Tombol Utama: `+ Create Category / Tambah Kategori` (Membuka dialog modal registrasi kategori baru).
- **Search & Filter Controls:**
  - Ukuran: Full width (`w-full`) responsif.
  - Komponen: Search input (pencarian berdasarkan nama kategori atau kode prefix) dan Tombol Reset.
- **Spesifikasi Tabel Data:**
  - `checkbox`: Checkbox seleksi baris untuk bulk delete.
  - `Code`: Kode singkatan 3 huruf kapital (contoh: *ELC* untuk electronic, *AUD* untuk audio, *FAS* untuk fashion).
  - `Category`: Nama kategori produk (contoh: *Gadget & Elektronik*).
  - `Products`: Total kuantitas produk yang terasosiasi dalam kategori (contoh: *17*).
  - `CreatedAt`: Tanggal pembuatan data (format `DD/MM/YYYY`, contoh: *18/02/2026*). Kolom ini memiliki indikator sortable (Ascending / Descending) pada table header.
  - `Actions`: Tombol ikon aksi more (`EllipsisVerticalIcon`) dengan dropdown menu: **Detail**, **Edit**, dan **Delete**.
- **Spesifikasi Sorting:**
  - Header kolom yang mendukung sorting: **Category (Name)** dan **CreatedAt**.
- **Spesifikasi Pagination:**
  - **Minimum Per Page adalah 10** (`perPage = 10`).
  - Opsi pilihan pagination: `10, 20, 50, 100`.

#### 6.6.4 Sub-Module: Merk (`/product/merk`)
- **Tujuan:** Manajemen basis data merek dagang, brand manufaktur, dan label vendor resmi produk.
- **Menu Hirarki:** `Product` (menu utama) -> `Merk` (sub menu, path: `/product/merk`).
- **Header & Action Bar:**
  - Layout: `justify-between items-center`
  - Konten: Judul modul (*Merk / Merk*) dan Sub-judul.
  - Tombol Utama: `+ Create Merk / Tambah Merk` (Membuka dialog modal pendaftaran merk baru).
- **Search & Filter Controls:**
  - Ukuran: Full width (`w-full`) responsif.
  - Komponen: Search input (pencarian berdasarkan nama brand atau negara asal) dan Tombol Reset.
- **Spesifikasi Tabel Data:**
  - `checkbox`: Checkbox seleksi baris untuk bulk delete.
  - `Merk`: Nama merek dagang / brand manufaktur (contoh: *Apple*, *Samsung*, *Nike*).
  - `Products`: Total kuantitas produk yang menggunakan merk tersebut (contoh: *21*).
  - `CreatedAt`: Tanggal pendaftaran data (format `DD/MM/YYYY`, contoh: *18/02/2026*). Kolom ini memiliki indikator sortable (Ascending / Descending) pada table header.
  - `Actions`: Tombol ikon aksi more (`EllipsisVerticalIcon`) dengan dropdown menu: **Detail**, **Edit**, dan **Delete**.
- **Spesifikasi Sorting:**
  - Header kolom yang mendukung sorting: **Merk (Name)** dan **CreatedAt**.
- **Spesifikasi Pagination:**
  - **Minimum Per Page adalah 10** (`perPage = 10`).
  - Opsi pilihan pagination: `10, 20, 50, 100`.

### 6.7 Module 6: Point of Sale (POS) System (`/pos`)
Modul Point of Sale (POS) mengelola pencatatan transaksi kasir toko fisik (offline store), riwayat struk penjualan, konfigurasi format penomoran ID transaksi otomatis, serta antarmuka layar register kasir mandiri (*dedicated cashier screen*).

#### 6.7.1 Sub-Module: Transaction (`/pos/transaction`)
- **Tujuan:** Pemantauan data riwayat transaksi checkout kasir, pencarian ID struk, audit kuantitas produk terjual, dan rekapitulasi pembayaran per fasilitas gudang/toko.
- **Menu Hirarki:** `Point Of Sale` (menu utama) -> `Transaction` (sub menu, path: `/pos/transaction`).
- **Header & Action Bar:**
  - Layout: `justify-between items-center`.
  - Konten: Judul modul (*POS Transactions / Transaksi POS*) dan Sub-judul (*kegunaan/deskripsi operasional kasir*).
  - Tombol Utama: `Cashier / Kasir`. **Catatan Penting:** Tombol cashier mengarah langsung ke page dedicated `/cashier` (di luar dashboard dan bukan modal dialog).
- **Search & Filter Controls:**
  - Ukuran: Full width (`w-full`) responsif.
  - Komponen:
    - Search input: Live search spesifik berdasarkan `Transaction ID` (contoh: *ID20261030001*) dengan clear icon (`XIcon`).
    - Filter dropdown Gudang: Filter berdasarkan fasilitas gudang/toko (*All Warehouses*, *Gudang A*, *Gudang B*, *Gudang C*, *Gudang D*).
    - Tombol Reset: Mereset seluruh parameter pencarian, filter gudang, dan pagination ke nilai awal.
- **Spesifikasi Tabel Data:**
  - `checkbox`: Checkbox seleksi baris untuk operasi massal (*Bulk Delete*), dilengkapi select-all di table header.
  - `Transaction ID`: Kode identifikasi unik transaksi (contoh: *ID20261030001*), ditampilkan dengan font-mono dan ikon receipt.
  - `Date`: Tanggal dan jam pelaksanaan transaksi (format `DD/MM/YYYY HH:mm`, contoh: *30/10/2026 14:35*). Kolom ini memiliki indikator sortable (Ascending / Descending) pada table header.
  - `Qty`: Kuantitas total item produk yang dibeli dalam transaksi (contoh: *2* atau *2 item*).
  - `Total Payment`: Total nilai nominal pembayaran transaksi (format Rupiah, contoh: *Rp 200.000*), ditampilkan dengan font-mono bold beserta label metode pembayaran.
  - `Actions`: Tombol ikon aksi more (`EllipsisVerticalIcon`) dengan dropdown menu:
    - **Detail:** Membuka pop-up modal rincian transaksi (daftar item produk yang dibeli beserta gambar thumbnail, harga satuan, subtotal, nama kasir, gudang, dan catatan transaksi).
    - **Edit:** Membuka formulir modal perbaruan data alokasi gudang, metode pembayaran, atau catatan transaksi.
    - **Delete:** Menghapus data rekaman transaksi dengan konfirmasi (`ConfirmDialog`).
- **Spesifikasi Sorting:**
  - Header kolom yang mendukung sorting: **Date** (Tanggal Transaksi).
- **Spesifikasi Pagination:**
  - **Minimum Per Page adalah 10** (`perPage = 10`).
  - Opsi pilihan pagination: `10, 20, 50, 100`.

#### 6.7.2 Sub-Module: Setting (`/pos/setting`)
- **Tujuan:** Konfigurasi format nomor struk transaksi otomatis dan parameter default mesin register kasir.
- **Menu Hirarki:** `Point Of Sale` (menu utama) -> `Setting` (sub menu, path: `/pos/setting`).
- **Fitur Utama:**
  - **Format Transaction ID:**
    - Live Interactive Preview: Menampilkan contoh hasil generate Transaction ID secara real-time (contoh: `ID20261030001`) dengan tombol salin (copy).
    - Prefix: Input teks kode awalan (contoh: *ID*, *TRX*, *POS*).
    - Pola Token Tanggal: Pilihan token tanggal (*YYYYMMDD* e.g. 20261030, *YYMMDD* e.g. 261030, *YYYYMM* e.g. 202610).
    - Jumlah Digit Nomor Urut: Pilihan padding digit counter (*3 Digit: 001*, *4 Digit: 0001*, *5 Digit: 00001*).
    - Pemisah (Separator): Pilihan pemisah antar segmen (*Tanpa Pemisah* e.g. `ID20261030001`, *Strip (-)* e.g. `ID-20261030-001`, *Slash (/)* e.g. `ID/20261030/001`).
    - Jadwal Reset Counter: Frekuensi reset nomor urut (*Daily*, *Monthly*, *Yearly*, *Never*).
  - **Preferensi Register & Kasir:**
    - Pemilihan Gudang Default transaksi kasir.
    - Nilai tarif pajak default (PPN 11%).
    - Toggle otomatis cetak struk (*Auto-print receipt*).
    - Toggle izin diskon manual kasir per item.
  - **Aksi:** Tombol *Save POS Settings* dengan feedback toast notification dan tombol *Reset to Defaults*.

#### 6.7.3 Dedicated Standalone Page: Cashier (`/cashier`)
- **Tujuan:** Antarmuka layar kasir mandiri (*fullscreen distraction-free register*) untuk operasional checkout cepat di meja kasir toko, berada di luar layout dashboard utama.
- **Navigasi & Header:**
  - Tombol kembali ke dashboard (*Back to Dashboard* mengarah ke `/pos/transaction`).
  - Branding kasir toko (*Cronsyst POS • Register #01 • Warehouse A*).
  - Jam digital real-time dan nama operator kasir aktif.
  - Pengalih bahasa (EN/ID) dan toggle tema (Light/Dark).
- **Area Katalog Produk (Sisi Kiri/Tengah):**
  - Kolom pencarian instan berdasarkan nama produk atau SKU.
  - Filter horizontal kategori produk (*All Categories*, *Gadgets*, *Computers*, *Fashion*, *Home Appliances*).
  - Grid kartu produk responsif dengan thumbnail gambar, SKU, nama produk, stok tersedia, dan harga Rupiah.
  - Interaksi sekali klik untuk menambahkan produk ke keranjang belanja (cart).
- **Area Keranjang & Pembayaran (Sisi Kanan):**
  - Rincian item pesanan aktif dengan kontrol kuantitas (`+` / `-` / hapus item).
  - Kalkulasi otomatis Subtotal, Pajak (PPN 11%), dan Grand Total.
  - Pemilih metode pembayaran: *QRIS*, *Cash (Tunai)*, *Debit Card*, *Credit Card*.
  - Kalkulasi uang diterima (*Cash Received*) dan nominal kembalian (*Change Due*).
  - Tombol besar eksekusi checkout (*Charge / Pay*).
- **Modal Struk Pembayaran Sukses:**
  - Menampilkan nomor transaksi otomatis sesuai format POS setting (contoh: *ID20261030001*).
  - Preview struk digital lengkap dengan rincian belanja, pajak, dan metode bayar.
  - Tombol cetak struk (*Print Receipt*) dan tombol transaksi baru (*New Order*).

---

## 7. Recommended Directory Structure

```text
omni-app/
├── src/
│   ├── app.html                  # HTML template (load Google Fonts Poppins & Geist)
│   ├── app.d.ts                  # Global TypeScript typings
│   ├── app.css                   # Global Tailwind imports & custom CSS variables
│   ├── routes/
│   │   ├── +layout.svelte        # Root layout (Theme provider, i18n store, font wrappers)
│   │   ├── +layout.ts            # Client load settings
│   │   ├── cashier/
│   │   │   └── +page.svelte      # Dedicated Standalone Cashier Register Page (Non-dashboard)
│   │   ├── (dashboard)/
│   │   │   ├── +layout.svelte    # Dashboard Shell (Sidebar, Header, Content Area)
│   │   │   ├── +page.svelte      # Overview / Root Dashboard (/)
│   │   │   ├── settings/
│   │   │   │   └── +page.svelte  # Theme, Language, Profile settings
│   │   │   ├── pos/
│   │   │   │   ├── +page.ts      # Redirect ke /pos/transaction
│   │   │   │   ├── transaction/
│   │   │   │   │   └── +page.svelte # POS Transactions (Table, Date Sort, Warehouse Filter, Cashier Link)
│   │   │   │   └── setting/
│   │   │   │       └── +page.svelte # POS Settings (Transaction ID Format, Live Preview, Cashier Preferences)
│   │   │   ├── product/
│   │   │   │   ├── +page.ts      # Redirect ke /product/manage
│   │   │   │   ├── manage/
│   │   │   │   │   ├── +page.svelte # Manage Product (Table Product, Collapsible Variants, Switch Status)
│   │   │   │   │   └── create/
│   │   │   │   │       └── +page.svelte # Dedicated Create Product Page (Non-dialog)
│   │   │   │   ├── categories/
│   │   │   │   │   └── +page.svelte # Categories (3-letter Code, Products Count, Sort, Search)
│   │   │   │   └── merk/
│   │   │   │       └── +page.svelte # Merk (Brand Name, Products Count, Sort, Search)
│   │   │   ├── user/
│   │   │   │   ├── +page.ts      # Redirect ke /user/manage
│   │   │   │   └── manage/
│   │   │   │       └── +page.svelte # Manage User (Table User, Role, Switch Status, CreatedAt Sort)
│   │   │   └── inventory/
│   │   │       ├── +page.ts      # Redirect ke /inventory/warehouse
│   │   │       ├── warehouse/
│   │   │       │   └── +page.svelte # Warehouse (Tabel Gudang, Manager, CreatedAt, Actions)
│   │   │       ├── stock-transfer/
│   │   │       │   └── +page.svelte # Stock Transfer (Origin, Destination, Status, Date Sort)
│   │   │       └── stock-opname/
│   │   │           └── +page.svelte # Stock Opname (Audit Code, Variant Badges, Recorder)
│   ├── lib/
│   │   ├── components/
│   │   │   ├── app-sidebar.svelte    # Root sidebar layout (dengan menu Warehouse, User, Settings)
│   │   │   ├── nav-main.svelte       # Menu navigasi utama hirarkis
│   │   │   ├── nav-projects.svelte   # Active sales channels (Shopee, TikTok, POS)
│   │   │   ├── nav-user.svelte       # User profile footer (dari block sidebar-07)
│   │   │   ├── ui/                   # shadcn-svelte components (switch, sidebar/*, button, card, etc.)
│   │   │   ├── layout/               # Header, MobileNav, Breadcrumbs
│   │   │   └── common/               # MetricCard, ChannelBadge, DataTable, StatusDot
│   │   ├── i18n/
│   │   │   ├── index.ts          # i18n helper & language switcher logic
│   │   │   └── locales/
│   │   │       ├── en.json       # English dictionary (Default)
│   │   │       └── id.json       # Indonesian dictionary
│   │   ├── stores/               # Runes/Stores untuk state (theme, language, active filters)
│   │   ├── types/                # TypeScript interfaces (Channel, Message, Metric, User)
│   │   └── utils/                # Utility functions (cn helper, formatters, date utils)
├── static/
│   └── favicon.png
├── tailwind.config.ts            # Tailwind config dengan warna custom (#F8FAFD & #0F172A)
├── svelte.config.js              # SvelteKit configuration
├── tsconfig.json                 # TypeScript strict configuration
├── components.json               # shadcn-svelte registry configuration
└── package.json
```

---

## 8. Tailwind CSS & Design Token Specification

Kode warna dan font harus di-mapping secara tepat pada konfigurasi CSS variables:

### 8.1 `src/app.css` (Tokens)
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 216 50% 98%;      /* #F8FAFD */
    --foreground: 222 47% 11%;      /* #0F172A */
    --card: 0 0% 100%;              /* #FFFFFF */
    --card-foreground: 222 47% 11%; /* #0F172A */
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;    /* #E2E8F0 */
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222 47% 11%;      /* #0F172A */
    --foreground: 210 40% 98%;      /* #F8FAFC */
    --card: 217 33% 17%;            /* #1E293B */
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;    /* #334155 */
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: 'Geist', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
  }
}
```

---

## 9. Step-by-Step AI Agent Execution Plan

AI Agent harus mengeksekusi project ini secara bertahap dengan urutan logis berikut:

### Phase 1: Initial Setup & Environment Verification
1. Inisialisasi SvelteKit project di root directory (`d:\SvelteKit\omni-app`) menggunakan runtime Bun dan template TypeScript.
2. Konfigurasi Tailwind CSS, `postcss`, dan `autoprefixer`.
3. Pasang font Poppins dan Geist Sans (via Google Fonts / CDN di `app.html` atau `@fontsource`).
4. Setup `shadcn-svelte` CLI (`bun x shadcn-svelte@latest init`).
5. Pasang dependencies pendukung via Bun:
   - `bun add @lucide/svelte lucide-svelte` (Ikon)
   - `bun add mode-watcher` (Dark/Light switcher)
   - `bun add clsx tailwind-merge`

### Phase 2: Design Tokens & Base Theme Verification
1. Implementasikan nilai CSS variables untuk Light Mode (`#F8FAFD`) dan Dark Mode (`#0F172A`).
2. Pastikan typography token `font-heading` (Poppins) dan `font-sans` (Geist) terdaftar di `tailwind.config.ts`.
3. Buat demo toggle theme untuk memverifikasi transisi warna tanpa glitch.

### Phase 3: Core Reusable UI Components
1. Tambahkan komponen dasar shadcn-svelte yang dibutuhkan:
   `button`, `card`, `badge`, `input`, `avatar`, `dropdown-menu`, `sheet`, `table`, `tabs`, `tooltip`.
2. Buat composite components:
   - `MetricCard.svelte` (Reusable KPI card dengan icon, title, value, dan trend indicator).
   - `LanguageSwitcher.svelte` (Selector interaktif EN / ID).
   - `ThemeToggle.svelte` (Selector Light / Dark / System).

### Phase 4: Localization (i18n) Implementation
1. Buat kamus bahasa `en.json` (default) dan `id.json`.
2. Implementasikan store / context bahasa yang responsif dan menyimpan state pilihan ke `localStorage`.
3. Pastikan semua label di Header, Sidebar, Dashboard, dan Settings menggunakan translation key (contoh: `$t('dashboard.totalConversations')`).

### Phase 5: Shell & Responsive Layout (Integrasi `sidebar-07`)
1. Jalankan perintah instalasi block `sidebar-07`:
   ```bash
   bun x shadcn-svelte@latest add sidebar-07
   ```
2. Sesuaikan komponen yang di-generate dari `sidebar-07` seiring perkembangan aplikasi:
   - Hubungkan item menu di `nav-main.svelte` dengan rute SvelteKit (`/settings`) dan header branding ke root dashboard (`/`).
   - Gantikan `team-switcher` dengan Branding Header Cronsyst (`GalleryVerticalEndIcon`, Nama Aplikasi `Cronsyst`, `v1.0.0`).
   - Integrasikan `nav-user.svelte` dengan sesi data pengguna dan tombol logout.
3. Bangun komponen `Header.svelte` di atas area konten:
   - Integrasikan `SidebarTrigger`, `Breadcrumb`, Global Search bar.
   - Pasang `LanguageSwitcher.svelte` (EN/ID) dan `ThemeToggle.svelte` (Light/Dark).
4. Pastikan layout beradaptasi sempurna di Desktop (collapsible/expandable), Tablet, dan Mobile (menggunakan Sheet drawer bawaan `sidebar-07`).

### Phase 6: Modules & Views Implementation
1. **Overview Page (`/`):**
   - 4 KPI cards dengan data dinamis.
   - Omnichannel message volume chart (SVG atau chart library ringan berbasis HTML5/CSS).
   - Recent interactions data table lengkap dengan badge status dan kanal.
2. **Omni Inbox Page (`/inbox`):**
   - 3-pane responsive chat hub (Channels, Message Threads, Active Chat + Customer Profile).
3. **Channels Page (`/channels`):**
   - Grid integrasi kanal dengan tombol status koneksi dan modal konfigurasi.
4. **Analytics Page (`/analytics`):**
   - Visualisasi response time dan channel distribution.
5. **Settings Page (`/settings`):**
   - Tab konfigurasi bahasa (EN/ID), preferensi tema, dan profil akun.
6. **Inventory Module (`/inventory`):**
   - **Warehouse (`/inventory/warehouse`):** Tabel master fasilitas, kuantitas produk, penugasan manajer, sorting `createdAt`, aksi dropdown (Detail, Copy, Edit, Delete), pencarian terpadu, dan formulir modal pembuatan gudang.
   - **Stock Transfer (`/inventory/stock-transfer`):** Tabel perpindahan stok antar hub, sorting `Date`, filter gudang, filter status (Success, Pending, Cancelled), aksi dropdown (Detail, Accept, Reject, Edit, Delete), dan modal transfer order.
   - **Stock Opname (`/inventory/stock-opname`):** Audit kesesuaian fisik stok, sorting `Date`, badge varian produk, filter gudang & status (Completed, Draft), aksi dropdown (Detail, Edit, Delete), dan modal registrasi opname.
7. **Product Module (`/product`):**
   - **Manage Product (`/product/manage` & `/product/manage/create`):** Tabel produk master, thumbnail gambar, SKU, stok, status toggle switch, sorting Name & CreatedAt, baris collapsible varian produk terperinci, filter multi-dimensi (kategori, merk, gudang), pagination min 10, serta halaman dedicated pembuatan produk baru (`/product/manage/create`).
   - **Categories (`/product/categories`):** Tabel kategori retail terstruktur, kode prefix 3 huruf (e.g. ELC), jumlah produk terasosiasi, sorting Name & CreatedAt, pencarian nama, pagination min 10, serta modal manajemen kategori.
   - **Merk (`/product/merk`):** Tabel brand manufaktur dan vendor, kuantitas produk, sorting Name & CreatedAt, pencarian nama, pagination min 10, serta modal registrasi merk.
8. **Point of Sale (POS) Module (`/pos` & `/cashier`):**
   - **POS Transactions (`/pos/transaction`):** Tabel riwayat transaksi kasir, pencarian Transaction ID, filter gudang, sorting `Date`, checkbox seleksi baris, kuantitas item, total pembayaran Rupiah, aksi dropdown (Detail, Edit, Delete), pagination min 10, serta tombol navigasi menuju `/cashier`.
   - **POS Setting (`/pos/setting`):** Konfigurasi generator Transaction ID (prefix, format token tanggal, panjang digit counter, separator, jadwal reset), live interactive preview, dan preferensi register kasir default.
   - **Dedicated Standalone Cashier (`/cashier`):** Antarmuka register kasir mandiri bebas distraksi di luar dashboard, pencarian produk cepat, katalog per kategori, keranjang belanja interaktif, kalkulasi PPN & kembalian, ragam metode pembayaran (Cash, QRIS, Debit, Credit), dan generator struk transaksi.

### Phase 7: Code Review, Cleanliness & Verification
1. Jalankan `bun run check` (Svelte/TypeScript verification) untuk memastikan tidak ada type error.
2. Jalankan `bun run build` untuk memverifikasi kompilasi bundel produksi dengan Bun.
3. Pastikan tidak ada hardcoded redundant CSS atau komponen duplikat (*Strict DRY*).
4. Tes visual di mode Light (`#F8FAFD`) dan Dark (`#0F172A`), serta verifikasi perubahan bahasa EN -> ID secara instan.

---

## 10. Acceptance Criteria

Project dinyatakan selesai dan memenuhi standar apabila:
1. **Tech Stack & Runtime Match:** Menggunakan Bun sebagai runtime & package manager + SvelteKit + TypeScript + shadcn-svelte + Tailwind CSS.
2. **Visual & Colors:**
   - Background Light Mode tepat `#F8FAFD`.
   - Background Dark Mode tepat `#0F172A`.
   - Headline menggunakan Poppins, Body/Label menggunakan Geist.
3. **Full Responsiveness:** Tampilan rapi dan dapat dioperasikan secara ergonomis di layar Desktop, Tablet, dan Smartphone (Mobile).
4. **Reusable Components:** Seluruh tombol, kartu statistik, badge kanal, dan tabel merupakan komponen modular yang dapat digunakan ulang.
5. **Bilingual (i18n):** Bahasa Inggris aktif secara default, dan seluruh antarmuka dapat beralih ke Bahasa Indonesia dengan 1 klik tanpa merusak layout.
6. **Clean Code & DRY:** Tidak ada duplikasi kode logika maupun styling redundan. Menggunakan fitur Svelte 5 terkini.
7. **Documentation:** Mengikuti standar resmi terkini dari SvelteKit dan shadcn-svelte.
