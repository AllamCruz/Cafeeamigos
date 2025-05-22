import React from 'react';
import { Coffee, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-[#5c3d2e] text-amber-50 p-6 relative">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Coffee className="h-8 w-8 text-amber-200" />
          <div>
            <h1 className="text-2xl md:text-3xl font-serif italic">Café & Amigos</h1>
            <p className="text-sm md:text-base font-light tracking-wider">Bistrô Bar</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <button 
              onClick={() => navigate('/admin/panel')}
              className="bg-amber-700 px-3 py-1.5 rounded text-sm hover:bg-amber-600 transition-colors"
            >
              Painel Admin
            </button>
          )}
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="bg-amber-800 px-3 py-1.5 rounded text-sm hover:bg-amber-700 transition-colors"
            >
              Sair
            </button>
          ) : (
            <button 
              onClick={handleAdminClick}
              className="text-amber-200/30 hover:text-amber-200/60 transition-colors"
              aria-label="Admin access"
            >
              <Lock className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;