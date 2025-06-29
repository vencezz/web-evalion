import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { createTablesIfNotExists } from './lib/supabase';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek apakah user sudah login
    const savedUser = localStorage.getItem('evalion_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Inisialisasi database
    createTablesIfNotExists();
    
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('evalion_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('evalion_user');
  };

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
        <p>Loading Evalion Nabung...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/" /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/" 
              element={
                user ? 
                <Dashboard user={user} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
              } 
            />
          </Routes>
        </AnimatePresence>
        
        {/* Footer */}
        <motion.footer 
          className="footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>by rapoi</p>
        </motion.footer>
      </div>
    </Router>
  );
}

export default App;