import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, User, ArrowLeft, Mail } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }
    
    try {
      const isSuccessful = await login(email, password);
      
      if (isSuccessful) {
        // Navigation will be handled by the auth state change in App.tsx
      } else {
        setError('Email ou senha incorretos');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-300px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-amber-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif text-[#5c3d2e]">Acesso ao Sistema</h2>
          <p className="text-gray-600 mt-2 text-sm">Entre com suas credenciais para acessar o sistema</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10 w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="seu@email.com"
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
                disabled={isLoading}
                className="pl-10 w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Sua senha"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5c3d2e] text-white py-2.5 rounded-md hover:bg-amber-800 transition-colors font-medium mb-4 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            <span>Voltar ao Cardápio</span>
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Caso tenha problemas, entre em <a href="https://wa.me/+55(88)981344755" className="text-blue-600 underline">contato com suporte</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;