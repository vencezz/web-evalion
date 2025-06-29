# 💰 Evalion Nabung

Website nabung untuk mahasiswa Teknik Industri angkatan 2024 (Evalion) dengan 5 kelas: A, B, C, D, dan E.

## 🚀 Fitur

- ✅ Form input data (nama, kelas, nominal)
- ✅ Rekap per kelas dan total semua kelas
- ✅ Export ke Excel dan PDF
- ✅ Login Admin (password: `lion24`) dan Guest
- ✅ Admin: CRUD data, Guest: view & download only
- ✅ Tema hitam-putih dengan animasi smooth
- ✅ Responsive untuk semua device
- ✅ Database Supabase

## 📋 Setup Supabase (Step by Step)

### 1. Buat Akun Supabase
1. Kunjungi [https://supabase.com](https://supabase.com)
2. Klik "Start your project" atau "Sign Up"
3. Daftar dengan email atau GitHub

### 2. Buat Project Baru
1. Setelah login, klik "New Project"
2. Pilih organization (biasanya nama Anda)
3. Isi:
   - **Project Name**: `evalion-nabung`
   - **Database Password**: Buat password yang kuat (simpan baik-baik!)
   - **Region**: Pilih yang terdekat (Singapore untuk Indonesia)
4. Klik "Create new project"
5. Tunggu 2-3 menit sampai project selesai dibuat

### 3. Setup Database
1. Di dashboard project, klik tab **"SQL Editor"** di sidebar kiri
2. Klik "New Query"
3. Copy-paste SQL berikut:

```sql
-- Buat tabel savings
CREATE TABLE savings (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  kelas VARCHAR(1) NOT NULL CHECK (kelas IN ('A', 'B', 'C', 'D', 'E')),
  nominal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;

-- Policy untuk read access (semua orang bisa baca)
CREATE POLICY "Enable read access for all users" ON savings
FOR SELECT USING (true);

-- Policy untuk insert/update/delete (semua orang bisa, karena kita handle auth di frontend)
CREATE POLICY "Enable insert for all users" ON savings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON savings
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON savings
FOR DELETE USING (true);

-- Insert data contoh
INSERT INTO savings (nama, kelas, nominal) VALUES
('John Doe', 'A', 50000),
('Jane Smith', 'B', 75000),
('Bob Johnson', 'A', 100000),
('Alice Brown', 'C', 60000),
('Charlie Wilson', 'D', 80000);
```

4. Klik "Run" untuk menjalankan query
5. Jika berhasil, Anda akan melihat pesan "Success"

### 4. Dapatkan API Keys
1. Klik tab **"Settings"** di sidebar kiri
2. Klik **"API"** di submenu
3. Copy dua nilai ini:
   - **Project URL** (contoh: `https://abcdefgh.supabase.co`)
   - **anon public key** (key yang panjang)

### 5. Konfigurasi di Aplikasi
1. Buka file `src/lib/supabase.js`
2. Ganti baris berikut:
```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'  // Ganti dengan Project URL
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'  // Ganti dengan anon public key
```

Contoh:
```javascript
const supabaseUrl = 'https://abcdefgh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## 🛠️ Instalasi dan Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Development Server
```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🔐 Login Credentials

- **Admin**: Password `lion24` (dapat CRUD data)
- **Guest**: Tanpa password (hanya view & download)

## 📱 Deployment ke Vercel

### 1. Install Vercel CLI (Opsional)
```bash
npm i -g vercel
```

### 2. Deploy via GitHub (Recommended)
1. Push code ke GitHub repository
2. Kunjungi [vercel.com](https://vercel.com)
3. Login dengan GitHub
4. Klik "New Project"
5. Import repository Anda
6. Vercel akan otomatis detect React app
7. Klik "Deploy"

### 3. Deploy via CLI
```bash
vercel
```

Ikuti instruksi di terminal.

## 📁 Struktur Project

```
eva/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Dashboard.js
│   │   └── Login.js
│   ├── lib/
│   │   └── supabase.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 🎨 Teknologi yang Digunakan

- **React 18** - Frontend framework
- **Supabase** - Database dan backend
- **Framer Motion** - Animasi smooth
- **React Router** - Routing
- **XLSX** - Export Excel
- **jsPDF** - Export PDF
- **Lucide React** - Icons

## 🐛 Troubleshooting

### Error: "relation 'savings' does not exist"
- Pastikan Anda sudah menjalankan SQL query di Supabase SQL Editor
- Cek apakah tabel `savings` sudah ada di tab "Table Editor"

### Error: "Invalid API key"
- Pastikan URL dan API key di `src/lib/supabase.js` sudah benar
- Cek kembali di Supabase Settings > API

### Data tidak tersimpan
- Cek console browser untuk error
- Pastikan RLS policies sudah dibuat dengan benar

### Website tidak responsive
- Clear browser cache
- Coba di browser lain

## 📞 Support

Jika ada masalah, cek:
1. Console browser (F12 > Console)
2. Network tab untuk error API
3. Supabase dashboard untuk logs

---

**by rapoi** 🚀

*Website Nabung Evalion - Angkatan Teknik Industri 2024*