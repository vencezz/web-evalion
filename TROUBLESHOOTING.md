# 🔧 Troubleshooting Guide - Evalion Nabung

## ❌ Masalah: Data Tidak Tersimpan ke Database Supabase

Jika data tidak tersimpan ke database Supabase, ikuti langkah-langkah berikut:

### 1. ✅ Cek Koneksi Supabase

**Buka Browser Console (F12 > Console) dan cari error:**

#### Error yang Mungkin Muncul:

**A. "relation 'savings' does not exist"**
```
PostgREST error: relation "public.savings" does not exist
```
**Solusi:** Tabel belum dibuat di Supabase

**B. "Invalid API key"**
```
Failed to fetch: 401 Unauthorized
```
**Solusi:** API Key salah atau expired

**C. "Row Level Security policy violation"**
```
PostgREST error: new row violates row-level security policy
```
**Solusi:** RLS policy belum dikonfigurasi dengan benar

### 2. 🗄️ Setup Database Supabase (Step by Step)

#### Langkah 1: Buat Tabel
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **"SQL Editor"** di sidebar kiri
4. Klik **"New Query"**
5. Copy-paste SQL berikut:

```sql
-- Hapus tabel jika sudah ada (opsional)
DROP TABLE IF EXISTS savings;

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

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Enable read access for all users" ON savings;
DROP POLICY IF EXISTS "Enable insert for all users" ON savings;
DROP POLICY IF EXISTS "Enable update for all users" ON savings;
DROP POLICY IF EXISTS "Enable delete for all users" ON savings;

-- Buat policy baru (SEMUA ORANG BISA AKSES)
CREATE POLICY "Enable read access for all users" ON savings
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON savings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON savings
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON savings
FOR DELETE USING (true);

-- Insert data contoh untuk testing
INSERT INTO savings (nama, kelas, nominal) VALUES
('Test User 1', 'A', 50000),
('Test User 2', 'B', 75000),
('Test User 3', 'C', 100000);
```

6. Klik **"Run"** untuk menjalankan query
7. Jika berhasil, akan muncul pesan "Success"

#### Langkah 2: Verifikasi Tabel
1. Klik tab **"Table Editor"** di sidebar
2. Pastikan tabel **"savings"** muncul
3. Klik tabel tersebut untuk melihat data contoh

#### Langkah 3: Cek API Settings
1. Klik **"Settings"** di sidebar
2. Klik **"API"**
3. Pastikan:
   - **Project URL** benar (format: `https://xxx.supabase.co`)
   - **anon public key** benar (key yang panjang)

### 3. 🔍 Debug di Browser

#### Cara Cek Error di Console:
1. Buka website di browser
2. Tekan **F12** untuk buka Developer Tools
3. Klik tab **"Console"**
4. Coba tambah data baru
5. Lihat error yang muncul

#### Cara Cek Network Request:
1. Buka Developer Tools (F12)
2. Klik tab **"Network"**
3. Coba tambah data baru
4. Cari request ke Supabase (biasanya ada URL supabase.co)
5. Klik request tersebut untuk melihat detail error

### 4. 🧪 Test Koneksi Manual

Tambahkan fungsi test ini di file `src/lib/supabase.js`:

```javascript
// Fungsi untuk test koneksi
export const testConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test 1: Cek koneksi dasar
    const { data, error } = await supabase
      .from('savings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 Sample data:', data);
    
    // Test 2: Coba insert data test
    const { data: insertData, error: insertError } = await supabase
      .from('savings')
      .insert([{ 
        nama: 'Test Connection', 
        kelas: 'A', 
        nominal: 1000 
      }])
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return false;
    }
    
    console.log('✅ Insert successful!', insertData);
    
    // Test 3: Hapus data test
    if (insertData && insertData[0]) {
      await supabase
        .from('savings')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🗑️ Test data cleaned up');
    }
    
    return true;
  } catch (err) {
    console.error('💥 Unexpected error:', err);
    return false;
  }
};
```

Kemudian panggil di Console browser:
```javascript
// Buka Console (F12) dan ketik:
import { testConnection } from './src/lib/supabase.js';
testConnection();
```

### 5. 🔧 Solusi Berdasarkan Error

#### Error: "relation 'savings' does not exist"
**Penyebab:** Tabel belum dibuat
**Solusi:** Jalankan SQL di langkah 2

#### Error: "Invalid API key" atau 401 Unauthorized
**Penyebab:** API key salah
**Solusi:** 
1. Cek di Supabase Settings > API
2. Copy ulang Project URL dan anon public key
3. Update file `src/lib/supabase.js`

#### Error: "Row Level Security policy violation"
**Penyebab:** RLS policy terlalu ketat
**Solusi:** Jalankan SQL policy di langkah 2

#### Error: "Failed to fetch" atau Network Error
**Penyebab:** 
- Internet bermasalah
- Supabase project di-pause
- CORS issue

**Solusi:**
1. Cek koneksi internet
2. Cek status project di Supabase Dashboard
3. Restart development server (`npm start`)

### 6. 📱 Cek di Supabase Dashboard

1. **Table Editor:**
   - Pastikan tabel `savings` ada
   - Cek apakah data baru muncul setelah submit

2. **Logs:**
   - Klik "Logs" di sidebar
   - Pilih "API Logs"
   - Lihat request yang masuk

3. **Auth:**
   - Pastikan RLS tidak memblokir request
   - Cek policy di "Authentication" > "Policies"

### 7. 🚨 Emergency Fallback

Jika masih bermasalah, gunakan mode offline sementara:

1. Edit file `src/components/Dashboard.js`
2. Cari fungsi `fetchData()` dan tambahkan:

```javascript
const fetchData = async () => {
  try {
    setLoading(true);
    
    // TEMPORARY: Skip Supabase, use localStorage
    const savedData = localStorage.getItem('evalion_savings');
    if (savedData) {
      setData(JSON.parse(savedData));
    } else {
      // Data dummy untuk testing
      const dummyData = [
        { id: 1, nama: 'John Doe', kelas: 'A', nominal: 50000, created_at: new Date().toISOString() },
        { id: 2, nama: 'Jane Smith', kelas: 'B', nominal: 75000, created_at: new Date().toISOString() },
      ];
      setData(dummyData);
      localStorage.setItem('evalion_savings', JSON.stringify(dummyData));
    }
  } catch (error) {
    console.error('Error:', error);
    setData([]);
  } finally {
    setLoading(false);
  }
};
```

### 8. 📞 Bantuan Lebih Lanjut

Jika masih bermasalah:

1. **Screenshot error** di Console browser
2. **Copy-paste error message** lengkap
3. **Cek Supabase project status** di dashboard
4. **Restart development server**: `Ctrl+C` lalu `npm start`

---

## ✅ Checklist Troubleshooting

- [ ] Supabase project sudah dibuat
- [ ] Tabel `savings` sudah dibuat dengan SQL
- [ ] RLS policies sudah dikonfigurasi
- [ ] URL dan API key sudah benar di `supabase.js`
- [ ] Tidak ada error di Console browser
- [ ] Network request berhasil di tab Network
- [ ] Data muncul di Supabase Table Editor

Jika semua checklist ✅, data seharusnya tersimpan dengan baik! 🎉