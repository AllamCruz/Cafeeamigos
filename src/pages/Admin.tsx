import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLogin from '../components/Admin/AdminLogin';
import AdminPanel from '../components/Admin/AdminPanel';
import { useAuth } from '../hooks/useAuth';

const Admin: React.FC = () => {
  const { isAuthenticated, isAdmin, isWaiter, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (isAdmin()) {
        // Admin goes to admin panel
        navigate('/admin/panel');
      } else if (isWaiter()) {
        // Waiter goes to waiter interface
        navigate('/waiter');
      }
    }
  }, [isAuthenticated, isAdmin, isWaiter, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-300px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#532b1b]"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isAdmin() ? (
              <Navigate to="/admin/panel" />
            ) : (
              <Navigate to="/waiter" />
            )
          ) : (
            <AdminLogin />
          )
        }
      />
      <Route
        path="/panel"
        element={
          isAuthenticated && isAdmin() ? (
            <AdminPanel />
          ) : (
            <Navigate to="/admin" />
          )
        }
      />
    </Routes>
  );
};

export default Admin;