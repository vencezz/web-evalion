# 🔧 Debug Supabase - Panduan Lengkap

## 🚨 Masalah Umum: Data Tidak Tersimpan

Jika data tidak tersimpan ke database Supabase, ikuti langkah-langkah berikut:

### 1. 📋 Cek Console Browser

1. Buka website di browser
2. Tekan `F12` atau klik kanan → "Inspect Element"
3. Pilih tab "Console"
4. Coba tambah/edit/hapus data
5. Lihat pesan error yang muncul

### 2. 🔍 Pesan Error Umum & Solusi

#### ❌ "Invalid API key"
**Penyebab:** API Key salah atau tidak valid
**Solusi:**
- Cek kembali API Key di Supabase Dashboard
- Pastikan menggunakan "anon" key, bukan "service_role" key
- Copy-paste ulang ke `src/lib/supabase.js`

#### ❌ "relation 'public.savings' does not exist"
**Penyebab:** Tabel `savings` belum dibuat
**Solusi:**
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik "SQL Editor" di sidebar
4. Jalankan query berikut:

```sql
-- Buat tabel savings
CREATE TABLE IF NOT EXISTS public.savings (
  id BIGSERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  nominal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

-- Buat policy untuk select (read)
CREATE POLICY "Enable read access for all users" ON public.savings
FOR SELECT USING (true);

-- Buat policy untuk insert (create)
CREATE POLICY "Enable insert for all users" ON public.savings
FOR INSERT WITH CHECK (true);

-- Buat policy untuk update
CREATE POLICY "Enable update for all users" ON public.savings
FOR UPDATE USING (true);

-- Buat policy untuk delete
CREATE POLICY "Enable delete for all users" ON public.savings
FOR DELETE USING (true);
```

#### ❌ "Row Level Security policy violation"
**Penyebab:** RLS policy tidak mengizinkan operasi
**Solusi:**
- Jalankan query SQL di atas untuk membuat policy yang benar
- Atau disable RLS sementara: `ALTER TABLE public.savings DISABLE ROW LEVEL SECURITY;`

#### ❌ "Failed to fetch" atau "Network Error"
**Penyebab:** Masalah koneksi atau URL salah
**Solusi:**
- Cek koneksi internet
- Pastikan Supabase URL benar (format: `https://xxx.supabase.co`)
- Cek status Supabase di https://status.supabase.com/

### 3. 🧪 Test Koneksi Manual

1. Buka Console browser
2. Paste dan jalankan kode berikut:

```javascript
// Test koneksi Supabase
const testSupabase = async () => {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Import supabase dari window (jika tersedia)
    const { supabase } = window;
    
    if (!supabase) {
      console.error('❌ Supabase client not found');
      return;
    }
    
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('savings').select('count');
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Connection successful!');
    
    // Test 2: Insert test data
    console.log('2️⃣ Testing insert...');
    const { data: insertData, error: insertError } = await supabase
      .from('savings')
      .insert([{ nama: 'Test User', kelas: 'Test Class', nominal: 1000 }])
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return;
    }
    
    console.log('✅ Insert successful:', insertData);
    
    // Test 3: Delete test data
    console.log('3️⃣ Cleaning up test data...');
    await supabase.from('savings').delete().eq('nama', 'Test User');
    console.log('✅ Cleanup successful!');
    
    console.log('🎉 All tests passed! Supabase is working correctly.');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
};

// Jalankan test
testSupabase();
```

### 4. 📝 Langkah Setup Supabase (Ulang)

Jika masih bermasalah, setup ulang dari awal:

1. **Buat Project Baru**
   - Buka https://supabase.com/
   - Login/Register
   - Klik "New Project"
   - Isi nama project dan password database
   - Tunggu setup selesai (2-3 menit)

2. **Ambil Credentials**
   - Klik "Settings" → "API"
   - Copy "Project URL"
   - Copy "anon public" key

3. **Update Kode**
   - Buka `src/lib/supabase.js`
   - Ganti `YOUR_SUPABASE_URL` dengan Project URL
   - Ganti `YOUR_SUPABASE_ANON_KEY` dengan anon key

4. **Buat Tabel**
   - Klik "SQL Editor"
   - Jalankan query SQL dari langkah 2 di atas

### 5. 🆘 Mode Darurat (Local Storage)

Jika Supabase tetap tidak bisa, aplikasi akan otomatis menggunakan Local Storage:

- Data tersimpan di browser (tidak permanen)
- Muncul alert "Data disimpan secara lokal"
- Data hilang jika browser di-clear

### 6. 📞 Bantuan Lebih Lanjut

Jika masih bermasalah:

1. Screenshot pesan error di console
2. Cek file `src/lib/supabase.js` sudah diisi dengan benar
3. Pastikan project Supabase aktif dan tidak di-pause
4. Coba buat project Supabase baru

---

## 🔧 Tools Debug Tambahan

### Network Tab
1. Buka Developer Tools (F12)
2. Pilih tab "Network"
3. Coba operasi CRUD
4. Lihat request ke Supabase (biasanya ke `*.supabase.co`)
5. Cek status code:
   - 200: Sukses
   - 401: Unauthorized (API key salah)
   - 404: Not found (tabel tidak ada)
   - 500: Server error

### Application Tab
1. Buka Developer Tools (F12)
2. Pilih tab "Application"
3. Expand "Local Storage"
4. Lihat data yang tersimpan lokal

Semoga panduan ini membantu! 🚀