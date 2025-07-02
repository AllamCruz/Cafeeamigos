import React, { useState, useEffect } from 'react';
import { Profile } from '../../types';
import { getAllWaiters, createWaiter, updateProfile, deleteWaiter } from '../../utils/storage';
import { X, Plus, Edit, Trash, User, Mail, Lock, Save, ArrowLeft, Users, AlertCircle, CheckCircle } from 'lucide-react';

interface WaiterManagerProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

interface WaiterFormData {
  name: string;
  email: string;
  password: string;
}

const WaiterManager: React.FC<WaiterManagerProps> = ({ onClose, onSuccess, onError }) => {
  const [waiters, setWaiters] = useState<Profile[]>([]);
  const [isAddingWaiter, setIsAddingWaiter] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<WaiterFormData>({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadWaiters();
  }, []);

  const loadWaiters = async () => {
    try {
      setIsLoading(true);
      const waitersList = await getAllWaiters();
      setWaiters(waitersList);
    } catch (error) {
      console.error('Error loading waiters:', error);
      onError('Erro ao carregar lista de garçons');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!editingWaiter && !formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!editingWaiter && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      if (editingWaiter) {
        // Update existing waiter
        await updateProfile({
          id: editingWaiter.id,
          name: formData.name,
          role: 'waiter'
        });
        onSuccess('Garçom atualizado com sucesso!');
      } else {
        // Create new waiter
        await createWaiter({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        onSuccess('Garçom criado com sucesso!');
      }

      setFormData({ name: '', email: '', password: '' });
      setIsAddingWaiter(false);
      setEditingWaiter(null);
      await loadWaiters();
    } catch (error) {
      console.error('Error saving waiter:', error);
      onError(editingWaiter ? 'Erro ao atualizar garçom' : 'Erro ao criar garçom');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (waiter: Profile) => {
    setEditingWaiter(waiter);
    setFormData({
      name: waiter.name,
      email: '', // We don't have email in profile, so leave empty
      password: ''
    });
    setIsAddingWaiter(true);
    setErrors({});
  };

  const handleDelete = async (waiterId: string, waiterName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o garçom "${waiterName}"?`)) {
      try {
        setIsLoading(true);
        await deleteWaiter(waiterId);
        onSuccess('Garçom excluído com sucesso!');
        await loadWaiters();
      } catch (error) {
        console.error('Error deleting waiter:', error);
        onError('Erro ao excluir garçom');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setIsAddingWaiter(false);
    setEditingWaiter(null);
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-serif text-[#532b1b] flex items-center">
              <Users className="mr-2" size={20} />
              Gerenciar Garçons
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Adicione, edite ou remova contas de garçons do sistema
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add New Waiter Form */}
          {isAddingWaiter && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                {editingWaiter ? <Edit size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
                {editingWaiter ? 'Editar Garçom' : 'Novo Garçom'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`pl-10 w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100`}
                        placeholder="Nome do garçom"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  {!editingWaiter && (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isLoading}
                          className={`pl-10 w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100`}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                  )}

                  {!editingWaiter && (
                    <div className={editingWaiter ? 'md:col-span-1' : 'md:col-span-2'}>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Senha *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={isLoading}
                          className={`pl-10 w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100`}
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                      {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save size={16} />
                    )}
                    <span>{editingWaiter ? 'Atualizar' : 'Criar'} Garçom</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add New Waiter Button */}
          {!isAddingWaiter && (
            <div className="mb-6">
              <button
                onClick={() => setIsAddingWaiter(true)}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-3 bg-[#532b1b] text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
              >
                <Plus size={16} />
                <span>Adicionar Garçom</span>
              </button>
            </div>
          )}

          {/* Waiters List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users size={18} className="mr-2" />
              Garçons Cadastrados ({waiters.length})
            </h3>

            {waiters.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum garçom cadastrado</p>
                <p className="text-gray-400 text-sm">Comece adicionando um novo garçom</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Garçom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Função
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Criado em
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {waiters.map((waiter) => (
                        <tr key={waiter.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-amber-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {waiter.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {waiter.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Garçom
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(waiter.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(waiter)}
                                disabled={isLoading}
                                className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50"
                                title="Editar garçom"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(waiter.id, waiter.name)}
                                disabled={isLoading}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                title="Excluir garçom"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            <span>Fechar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaiterManager;