import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Users } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulasi delay untuk UX yang lebih baik
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === 'lion24') {
      onLogin({
        role: 'admin',
        name: 'Admin Evalion'
      });
    } else {
      setError('Password salah!');
    }
    
    setLoading(false);
  };

  const handleGuestLogin = () => {
    onLogin({
      role: 'guest',
      name: 'Guest User'
    });
  };

  return (
    <motion.div 
      className="login-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="login-card"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.h1 
          className="login-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          💰 Evalion Nabung
        </motion.h1>
        
        <motion.p 
          className="login-subtitle"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Website Nabung Angkatan Teknik Industri 2024
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Admin Login Form */}
          <form onSubmit={handleAdminLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="password">
                <LogIn size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Login sebagai Admin
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Masukkan password admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {error && (
              <motion.div 
                style={{ color: '#ff4444', fontSize: '0.875rem', marginBottom: '1rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}
            
            <motion.button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !password}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ marginBottom: '1rem' }}
            >
              {loading ? 'Masuk...' : 'Masuk sebagai Admin'}
            </motion.button>
          </form>

          {/* Guest Login */}
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <span style={{ color: '#cccccc', fontSize: '0.875rem' }}>atau</span>
          </div>

          <motion.button
            type="button"
            className="btn btn-secondary"
            onClick={handleGuestLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ width: '100%' }}
          >
            <Users size={16} style={{ marginRight: '8px' }} />
            Masuk sebagai Guest
          </motion.button>

          <motion.div 
            style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '10px',
              fontSize: '0.875rem',
              color: '#cccccc'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <strong>Info:</strong>
            <br />• Admin: Dapat menambah, edit, dan hapus data
            <br />• Guest: Hanya dapat melihat dan download data
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;