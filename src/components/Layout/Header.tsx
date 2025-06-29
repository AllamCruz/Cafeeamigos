import React from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useWelcome } from '../../hooks/useWelcome';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { resetWelcome } = useWelcome();
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    resetWelcome();
  };

  return (
    <header className="bg-[#5c3d2e] text-amber-50 p-6 relative">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button 
          onClick={handleLogoClick}
          className="hover:opacity-80 transition-opacity"
        >
          <img 
            src="/IMG_20250629_114221.jpg" 
            alt="Logo Café & Amigos Bistrô Bar" 
            className="h-16 w-auto object-contain"
          />
        </button>
        
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