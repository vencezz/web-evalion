import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  FileSpreadsheet, 
  FileText,
  Users,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Dashboard = ({ user, onLogout }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ nama: '', kelas: '', nominal: '' });
  const [editingId, setEditingId] = useState(null);
  const [selectedClass, setSelectedClass] = useState('ALL');

  const classes = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching data from Supabase...');
      const { data: savings, error } = await supabase
        .from('savings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase fetch failed:', error);
        console.log('💡 Kemungkinan penyebab:');
        console.log('   1. Supabase URL/Key belum diisi');
        console.log('   2. Tabel "savings" belum dibuat');
        console.log('   3. RLS policy belum dikonfigurasi');
        console.log('   4. Koneksi internet bermasalah');
        alert('❌ Gagal mengambil data dari Supabase. Cek console untuk detail.');
        // Jika tabel belum ada, gunakan data dummy untuk demo
        setData([
          { id: 1, nama: 'John Doe', kelas: 'A', nominal: 50000, created_at: new Date().toISOString() },
          { id: 2, nama: 'Jane Smith', kelas: 'B', nominal: 75000, created_at: new Date().toISOString() },
          { id: 3, nama: 'Bob Johnson', kelas: 'A', nominal: 100000, created_at: new Date().toISOString() },
        ]);
      } else {
        console.log('✅ Data berhasil diambil dari Supabase:', savings?.length || 0, 'records');
        setData(savings || []);
      }
    } catch (error) {
      console.error('💥 Unexpected error fetching data:', error);
      alert('❌ Terjadi error saat mengambil data. Cek console browser untuk detail.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.kelas || !formData.nominal) return;

    try {
      const nominal = parseInt(formData.nominal);
      
      if (editingId) {
        // Update existing record
        console.log('🔄 Updating data to Supabase...');
        const { error } = await supabase
          .from('savings')
          .update({ 
            nama: formData.nama, 
            kelas: formData.kelas, 
            nominal: nominal,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) {
          console.error('❌ Supabase update failed:', error);
          console.log('🔄 Using fallback mode...');
          // Fallback untuk demo jika Supabase belum setup
          setData(prev => prev.map(item => 
            item.id === editingId 
              ? { ...item, nama: formData.nama, kelas: formData.kelas, nominal: nominal }
              : item
          ));
          alert('⚠️ Data disimpan secara lokal. Cek console untuk error Supabase.');
        } else {
          console.log('✅ Data berhasil diupdate ke Supabase!');
        }
        setEditingId(null);
      } else {
        // Add new record
        console.log('🔄 Saving data to Supabase...');
        const { data: insertedData, error } = await supabase
          .from('savings')
          .insert([{ 
            nama: formData.nama, 
            kelas: formData.kelas, 
            nominal: nominal 
          }])
          .select();

        if (error) {
          console.error('❌ Supabase insert failed:', error);
          console.log('🔄 Using fallback mode...');
          // Fallback untuk demo jika Supabase belum setup
          const newRecord = {
            id: Date.now(),
            nama: formData.nama,
            kelas: formData.kelas,
            nominal: nominal,
            created_at: new Date().toISOString()
          };
          setData(prev => [newRecord, ...prev]);
          alert('⚠️ Data disimpan secara lokal. Cek console untuk error Supabase.');
        } else {
          console.log('✅ Data berhasil disimpan ke Supabase!', insertedData);
        }
      }
      
      setFormData({ nama: '', kelas: '', nominal: '' });
      fetchData();
    } catch (error) {
      console.error('💥 Unexpected error saving data:', error);
      alert('❌ Terjadi error. Cek console browser untuk detail.');
    }
  };

  const handleEdit = (item) => {
    setFormData({ nama: item.nama, kelas: item.kelas, nominal: item.nominal.toString() });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    
    try {
      console.log('🔄 Deleting data from Supabase...');
      const { error } = await supabase
        .from('savings')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Supabase delete failed:', error);
        console.log('🔄 Using fallback mode...');
        // Fallback untuk demo
        setData(prev => prev.filter(item => item.id !== id));
        alert('⚠️ Data dihapus secara lokal. Cek console untuk error Supabase.');
      } else {
        console.log('✅ Data berhasil dihapus dari Supabase!');
        fetchData();
      }
    } catch (error) {
      console.error('💥 Unexpected error deleting data:', error);
      alert('❌ Terjadi error saat menghapus data. Cek console browser untuk detail.');
    }
  };

  const getFilteredData = () => {
    if (selectedClass === 'ALL') return data;
    return data.filter(item => item.kelas === selectedClass);
  };

  const getStats = () => {
    const filteredData = getFilteredData();
    const totalAmount = filteredData.reduce((sum, item) => sum + item.nominal, 0);
    const totalMembers = filteredData.length;
    
    const classSummary = classes.map(cls => {
      const classData = data.filter(item => item.kelas === cls);
      return {
        class: cls,
        total: classData.reduce((sum, item) => sum + item.nominal, 0),
        members: classData.length
      };
    });

    return { totalAmount, totalMembers, classSummary };
  };

  const exportToExcel = () => {
    const filteredData = getFilteredData();
    const exportData = filteredData.map((item, index) => ({
      'No': index + 1,
      'Nama': item.nama,
      'Kelas': item.kelas,
      'Nominal': item.nominal,
      'Tanggal': new Date(item.created_at).toLocaleDateString('id-ID')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Nabung');
    
    const fileName = selectedClass === 'ALL' 
      ? 'evalion-nabung-semua-kelas.xlsx'
      : `evalion-nabung-kelas-${selectedClass}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    const filteredData = getFilteredData();
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text('Evalion Nabung - Data Tabungan', 20, 20);
    doc.setFontSize(12);
    doc.text(`Kelas: ${selectedClass === 'ALL' ? 'Semua Kelas' : selectedClass}`, 20, 30);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, 40);
    
    // Table
    const tableData = filteredData.map((item, index) => [
      index + 1,
      item.nama,
      item.kelas,
      `Rp ${item.nominal.toLocaleString('id-ID')}`,
      new Date(item.created_at).toLocaleDateString('id-ID')
    ]);
    
    doc.autoTable({
      head: [['No', 'Nama', 'Kelas', 'Nominal', 'Tanggal']],
      body: tableData,
      startY: 50,
    });
    
    // Summary
    const stats = getStats();
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.text(`Total: Rp ${stats.totalAmount.toLocaleString('id-ID')}`, 20, finalY);
    doc.text(`Jumlah Anggota: ${stats.totalMembers} orang`, 20, finalY + 10);
    
    // Footer
    doc.setFontSize(10);
    doc.text('by rapoi', 20, doc.internal.pageSize.height - 20);
    
    const fileName = selectedClass === 'ALL' 
      ? 'evalion-nabung-semua-kelas.pdf'
      : `evalion-nabung-kelas-${selectedClass}.pdf`;
    
    doc.save(fileName);
  };

  const stats = getStats();
  const filteredData = getFilteredData();

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          💰
        </motion.div>
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="dashboard-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="dashboard-title">💰 Evalion Nabung</h1>
        <div className="user-info">
          <span className="user-role">{user.role === 'admin' ? '👑 Admin' : '👤 Guest'}</span>
          <span>{user.name}</span>
          <motion.button 
            className="btn btn-secondary"
            onClick={onLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={16} /> Keluar
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        className="stats-grid"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="stat-card">
          <div className="stat-value">
            <DollarSign size={24} style={{ display: 'inline', marginRight: '8px' }} />
            Rp {stats.totalAmount.toLocaleString('id-ID')}
          </div>
          <div className="stat-label">Total Tabungan {selectedClass === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedClass}`}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            <Users size={24} style={{ display: 'inline', marginRight: '8px' }} />
            {stats.totalMembers}
          </div>
          <div className="stat-label">Total Anggota</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            <TrendingUp size={24} style={{ display: 'inline', marginRight: '8px' }} />
            {stats.totalMembers > 0 ? Math.round(stats.totalAmount / stats.totalMembers).toLocaleString('id-ID') : 0}
          </div>
          <div className="stat-label">Rata-rata per Orang</div>
        </div>
      </motion.div>

      {/* Form Input (Admin Only) */}
      <AnimatePresence>
        {user.role === 'admin' && (
          <motion.div 
            className="card"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="card-title">
              {editingId ? <Edit size={20} /> : <Plus size={20} />}
              {editingId ? ' Edit Data' : ' Tambah Data Baru'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nama</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Masukkan nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Kelas</label>
                  <select
                    className="form-select"
                    value={formData.kelas}
                    onChange={(e) => setFormData({...formData, kelas: e.target.value})}
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>Kelas {cls}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Nominal</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Masukkan nominal"
                    value={formData.nominal}
                    onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                    required
                    min="0"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <motion.button 
                  type="submit" 
                  className="btn btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingId ? 'Update Data' : 'Tambah Data'}
                </motion.button>
                {editingId && (
                  <motion.button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ nama: '', kelas: '', nominal: '' });
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Batal
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter dan Export */}
      <motion.div 
        className="card"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <label style={{ marginRight: '1rem' }}>Filter Kelas:</label>
            <select
              className="form-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>Kelas {cls}</option>
              ))}
            </select>
          </div>
          <div className="export-buttons">
            <motion.button 
              className="btn btn-secondary"
              onClick={exportToExcel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileSpreadsheet size={16} /> Export Excel
            </motion.button>
            <motion.button 
              className="btn btn-secondary"
              onClick={exportToPDF}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileText size={16} /> Export PDF
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div 
        className="card"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <h2 className="card-title">Data Tabungan {selectedClass === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedClass}`}</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Nominal</th>
                <th>Tanggal</th>
                {user.role === 'admin' && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredData.map((item, index) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>{index + 1}</td>
                    <td>{item.nama}</td>
                    <td>{item.kelas}</td>
                    <td>Rp {item.nominal.toLocaleString('id-ID')}</td>
                    <td>{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                    {user.role === 'admin' && (
                      <td>
                        <div className="table-actions">
                          <motion.button 
                            className="btn btn-secondary btn-small"
                            onClick={() => handleEdit(item)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit size={12} /> Edit
                          </motion.button>
                          <motion.button 
                            className="btn btn-danger btn-small"
                            onClick={() => handleDelete(item.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 size={12} /> Hapus
                          </motion.button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <motion.div 
              style={{ textAlign: 'center', padding: '2rem', color: '#666' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Belum ada data untuk {selectedClass === 'ALL' ? 'semua kelas' : `kelas ${selectedClass}`}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Class Summary */}
      <motion.div 
        className="card"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <h2 className="card-title">Rekap Per Kelas</h2>
        <div className="stats-grid">
          {stats.classSummary.map((classData, index) => (
            <motion.div 
              key={classData.class}
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + index * 0.1 }}
            >
              <div className="stat-value">Kelas {classData.class}</div>
              <div className="stat-label">Rp {classData.total.toLocaleString('id-ID')}</div>
              <div className="stat-label">{classData.members} anggota</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;