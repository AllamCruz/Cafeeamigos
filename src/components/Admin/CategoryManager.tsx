import React, { useState } from 'react';
import { useMenu } from '../../hooks/useMenu';
import { Category } from '../../types';
import { X, Plus, Edit, Trash, FolderOpen, Folder, Save, ArrowLeft } from 'lucide-react';

interface CategoryManagerProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onClose, onSuccess, onError }) => {
  const {
    categories,
    getParentCategories,
    getSubcategories,
    addCategory,
    updateCategory,
    deleteCategory
  } = useMenu();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const parentCategories = getParentCategories();

  const handleAddCategory = async (parentId?: string) => {
    if (!newCategoryName.trim()) return;

    try {
      setIsLoading(true);
      await addCategory({
        name: newCategoryName.trim(),
        parentCategoryId: parentId || null
      });
      
      setNewCategoryName('');
      setIsAddingCategory(false);
      setIsAddingSubcategory(null);
      onSuccess(parentId ? 'Subcategoria adicionada com sucesso!' : 'Categoria adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding category:', error);
      onError('Erro ao adicionar categoria. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    try {
      setIsLoading(true);
      await updateCategory(editingCategory);
      setEditingCategory(null);
      onSuccess('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating category:', error);
      onError('Erro ao atualizar categoria. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    const subcategories = getSubcategories(id);
    
    let confirmMessage = `Tem certeza que deseja excluir "${category?.name}"?`;
    
    if (subcategories.length > 0) {
      confirmMessage += `\n\nEsta ação também excluirá ${subcategories.length} subcategoria(s).`;
    }

    if (window.confirm(confirmMessage)) {
      try {
        setIsLoading(true);
        await deleteCategory(id);
        onSuccess('Categoria excluída com sucesso!');
      } catch (error) {
        console.error('Error deleting category:', error);
        onError('Erro ao excluir categoria. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-serif text-[#532b1b]">Gerenciar Categorias</h2>
            <p className="text-sm text-gray-600 mt-1">
              Organize suas categorias e subcategorias do cardápio
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
          {/* Add New Category */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Plus size={18} className="mr-2" />
              Nova Categoria Principal
            </h3>
            
            {isAddingCategory ? (
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da categoria"
                  disabled={isLoading}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  onClick={() => handleAddCategory()}
                  disabled={isLoading || !newCategoryName.trim()}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Salvar</span>
                </button>
                <button
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }}
                  disabled={isLoading}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCategory(true)}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-3 bg-[#532b1b] text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
              >
                <Plus size={16} />
                <span>Adicionar Categoria</span>
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            {parentCategories.map((category) => {
              const subcategories = getSubcategories(category.id);
              
              return (
                <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Parent Category */}
                  <div className="bg-white p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FolderOpen className="h-5 w-5 text-amber-600 mr-3" />
                      {editingCategory?.id === category.id ? (
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            disabled={isLoading}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-gray-100"
                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory()}
                          />
                          <button
                            onClick={handleUpdateCategory}
                            disabled={isLoading}
                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            disabled={isLoading}
                            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-500">
                            {subcategories.length} subcategoria(s)
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {editingCategory?.id !== category.id && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setIsAddingSubcategory(category.id)}
                          disabled={isLoading}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          title="Adicionar subcategoria"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => setEditingCategory(category)}
                          disabled={isLoading}
                          className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                          title="Editar categoria"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={isLoading}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir categoria"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Add Subcategory Form */}
                  {isAddingSubcategory === category.id && (
                    <div className="bg-gray-50 p-4 border-t">
                      <div className="flex items-center space-x-3">
                        <Folder className="h-4 w-4 text-amber-500" />
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Nome da subcategoria"
                          disabled={isLoading}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-gray-100"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCategory(category.id)}
                        />
                        <button
                          onClick={() => handleAddCategory(category.id)}
                          disabled={isLoading || !newCategoryName.trim()}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingSubcategory(null);
                            setNewCategoryName('');
                          }}
                          disabled={isLoading}
                          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subcategories */}
                  {subcategories.length > 0 && (
                    <div className="bg-gray-50 border-t">
                      {subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="p-3 border-b border-gray-200 last:border-b-0 flex items-center justify-between">
                          <div className="flex items-center ml-6">
                            <Folder className="h-4 w-4 text-amber-500 mr-3" />
                            {editingCategory?.id === subcategory.id ? (
                              <div className="flex items-center space-x-3">
                                <input
                                  type="text"
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                  disabled={isLoading}
                                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-gray-100"
                                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory()}
                                />
                                <button
                                  onClick={handleUpdateCategory}
                                  disabled={isLoading}
                                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                                >
                                  Salvar
                                </button>
                                <button
                                  onClick={() => setEditingCategory(null)}
                                  disabled={isLoading}
                                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm disabled:opacity-50"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-700">{subcategory.name}</span>
                            )}
                          </div>
                          
                          {editingCategory?.id !== subcategory.id && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingCategory(subcategory)}
                                disabled={isLoading}
                                className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                                title="Editar subcategoria"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(subcategory.id)}
                                disabled={isLoading}
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                title="Excluir subcategoria"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {parentCategories.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhuma categoria encontrada</p>
              <p className="text-gray-400 text-sm">Comece adicionando uma categoria principal</p>
            </div>
          )}
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

export default CategoryManager;