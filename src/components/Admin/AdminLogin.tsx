import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, User, ArrowLeft } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    const isSuccessful = login(username, password);
    
    if (isSuccessful) {
      navigate('/admin/panel');
    } else {
      setError('Usuário ou senha incorretos');
    }
  };

  return (
    <div className="min-h-[calc(100vh-300px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-amber-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif text-[#5c3d2e]">Acesso Administrativo</h2>
          <p className="text-gray-600 mt-2 text-sm">Entre com suas credenciais para acessar o painel</p>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-1">
              Usuário
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Seu nome de usuário"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
              Senha
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Sua senha"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#5c3d2e] text-white py-2.5 rounded-md hover:bg-amber-800 transition-colors font-medium mb-4"
          >
            Entrar
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center space-x-2 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
          >
            <ArrowLeft size={16} />
            <span>Voltar ao Cardápio</span>
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Caso de erro entre em <a href= "https://wa.me/+55(88)981344755" class="text-blue-600 underline">contato com suporte</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;