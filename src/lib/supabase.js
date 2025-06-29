import { createClient } from '@supabase/supabase-js'

// Ganti dengan URL dan API Key Supabase Anda
// Untuk mendapatkan ini:
// 1. Buat akun di https://supabase.com
// 2. Buat project baru
// 3. Pergi ke Settings > API
// 4. Copy URL dan anon public key
const supabaseUrl = 'https://mkhprezlbtecgyerilcf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1raHByZXpsYnRlY2d5ZXJpbGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzY1MDgsImV4cCI6MjA2Njc1MjUwOH0.8K9ffwhHvIPfPLSRInhq1GV6bL_S0SbA-UltoLZPDMw'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Fungsi untuk membuat tabel jika belum ada
export const createTablesIfNotExists = async () => {
  try {
    // Cek apakah tabel sudah ada
    const { error } = await supabase
      .from('savings')
      .select('*')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('❌ Tabel belum ada, silakan buat tabel di Supabase Dashboard')
      console.log('📋 SQL untuk membuat tabel:')
      console.log(`
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
        
        -- Policy untuk semua user bisa akses
        CREATE POLICY "Enable read access for all users" ON savings
        FOR SELECT USING (true);
        
        CREATE POLICY "Enable insert for all users" ON savings
        FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Enable update for all users" ON savings
        FOR UPDATE USING (true);
        
        CREATE POLICY "Enable delete for all users" ON savings
        FOR DELETE USING (true);
      `)
    } else if (error) {
      console.error('❌ Error koneksi Supabase:', error)
    } else {
      console.log('✅ Koneksi Supabase berhasil!')
    }
  } catch (err) {
    console.error('💥 Error checking tables:', err)
  }
}

// Fungsi untuk test koneksi Supabase
export const testConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...')
    
    // Test 1: Cek koneksi dasar
    const { data, error } = await supabase
      .from('savings')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error)
      if (error.code === 'PGRST116') {
        console.log('💡 Solusi: Buat tabel dulu di Supabase Dashboard')
      }
      return false
    }
    
    console.log('✅ Connection successful!')
    console.log('📊 Sample data:', data)
    
    // Test 2: Coba insert data test
    const testData = { 
      nama: 'Test Connection ' + Date.now(), 
      kelas: 'A', 
      nominal: 1000 
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('savings')
      .insert([testData])
      .select()
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError)
      return false
    }
    
    console.log('✅ Insert successful!', insertData)
    
    // Test 3: Hapus data test
    if (insertData && insertData[0]) {
      await supabase
        .from('savings')
        .delete()
        .eq('id', insertData[0].id)
      console.log('🗑️ Test data cleaned up')
    }
    
    console.log('🎉 Semua test berhasil! Database siap digunakan.')
    return true
  } catch (err) {
    console.error('💥 Unexpected error:', err)
    return false
  }
}

// Auto-run test saat development
if (process.env.NODE_ENV === 'development') {
  // Delay untuk memastikan app sudah load
  setTimeout(() => {
    testConnection()
  }, 2000)
}