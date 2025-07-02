import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ClipboardList, User, LogOut } from 'lucide-react';

const Waiter: React.FC = () => {
  const { user, logout, isWaiter } = useAuth();

  if (!isWaiter()) {
    return <Navigate to="/admin" />;
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#fcf8f3]">
      {/* Header */}
      <div className="bg-[#532b1b] text-amber-50 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ClipboardList size={24} />
            <div>
              <h1 className="text-xl font-serif">Sistema de Pedidos</h1>
              <p className="text-amber-200 text-sm">Bem-vindo, {user?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-amber-800 px-3 py-1.5 rounded text-sm hover:bg-amber-700 transition-colors"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-[#532b1b] mb-4">Sistema de Pedidos</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Esta é a interface do garçom. Em breve você poderá fazer pedidos, 
            gerenciar mesas e acompanhar o status dos pedidos.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto border border-amber-100">
            <div className="flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Perfil do Garçom</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Nome:</strong> {user?.name}</p>
              <p><strong>Função:</strong> Garçom</p>
              <p><strong>Status:</strong> <span className="text-green-600">Ativo</span></p>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Funcionalidades em desenvolvimento:</p>
            <ul className="mt-2 space-y-1">
              <li>• Fazer novos pedidos</li>
              <li>• Gerenciar mesas</li>
              <li>• Acompanhar status dos pedidos</li>
              <li>• Histórico de vendas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Waiter;