import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PortfolioBuilder from './pages/PortfolioBuilder';
import PortfolioView from './pages/PortfolioView';
import Verify from './pages/Verify';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={logout} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register onLogin={login} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/build" element={user ? <PortfolioBuilder user={user} /> : <Navigate to="/login" />} />
        <Route path="/build/:id" element={user ? <PortfolioBuilder user={user} /> : <Navigate to="/login" />} />
        <Route path="/portfolio/:id" element={<PortfolioView />} />
        <Route path="/verify/:id" element={<Verify />} />
      </Routes>
    </div>
  );
}

export default App;
