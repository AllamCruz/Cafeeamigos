import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from '../components/Admin/AdminLogin';
import AdminPanel from '../components/Admin/AdminPanel';
import { useAuth } from '../hooks/useAuth';

const Admin: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/admin/panel" /> : <AdminLogin />}
      />
      <Route
        path="/panel"
        element={isAuthenticated ? <AdminPanel /> : <Navigate to="/admin" />}
      />
    </Routes>
  );
};

export default Admin;