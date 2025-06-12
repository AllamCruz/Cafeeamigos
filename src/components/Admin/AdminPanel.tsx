import React, { useState } from 'react';
import { useMenu } from '../../hooks/useMenu';
import { MenuItem, Category } from '../../types';
import EditMenuItem from './EditMenuItem';
import { Edit, Trash, Plus, ArrowLeft, GripVertical, ChevronRight, ChevronDown, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableCategoryProps {
  category: Category;
  level?: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAddSubcategory: (parentId: string) => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  items: MenuItem[];
  subcategories: Category[];
  getItemsByCategory: (categoryId: string) => MenuItem[];
  getSubcategories: (categoryId: string) => Category[];
}

const SortableCategory: React.FC<SortableCategoryProps> = ({ 
  category, 
  level = 0, 
  onEdit, 
  onDelete,
  onAddSubcategory,
  onEditItem,
  onDeleteItem,
  items,
  subcategories,
  getItemsByCategory,
  getSubcategories
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    marginLeft: `${level * 1.5}rem`
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white border border-amber-100 rounded-lg p-3 shadow-sm flex justify-between items-center mb-2 ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-center flex-1">
          {(subcategories.length > 0 || items.length > 0) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 mr-1"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <button
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <span className="truncate ml-2">{category.name}</span>
          <span className="ml-2 text-xs text-gray-500">
            ({items.length} items, {subcategories.length} subcategorias)
          </span>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => onAddSubcategory(category.id)}
            className="p-1.5 text-green-600 hover:text-green-700"
            title="Adicionar subcategoria"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-blue-600 hover:text-blue-700"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-1.5 text-red-600 hover:text-red-700"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Display items in this category */}
          {items.length > 0 && (
            <div className="ml-6 mb-2">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Descrição
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço Base
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.imageUrl && (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="h-10 w-10 rounded-full mr-3 object-cover"
                              />
                            )}
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                              {item.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="text-sm text-gray-500 truncate max-w-[200px] lg:max-w-[300px]">
                            {item.description}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.sizes && item.sizes.length > 0 
                              ? `${item.sizes.length} tamanhos`
                              : `R$ ${item.price.toFixed(2)}`
                            }
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => onEditItem(item)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="p-1.5 text-red-600 hover:text-red-900"
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

          {/* Render subcategories recursively */}
          {subcategories.map(subcat => (
            <SortableCategory
              key={subcat.id}
              category={subcat}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubcategory={onAddSubcategory}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
              items={getItemsByCategory(subcat.id)}
              subcategories={getSubcategories(subcat.id)}
              getItemsByCategory={getItemsByCategory}
              getSubcategories={getSubcategories}
            />
          ))}
        </>
      )}
    </>
  );
};

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
      type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-500" />
      )}
      <span className={`text-sm ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
        {message}
      </span>
      <button
        onClick={onClose}
        className={`ml-2 ${type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}`}
      >
        <X size={16} />
      </button>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const {
    menuItems,
    categories,
    getParentCategories,
    getSubcategories,
    getMenuItemsByCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  } = useMenu();

  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string, parentCategoryId?: string | null } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const newCategories = [...categories];
      const [movedCategory] = newCategories.splice(oldIndex, 1);
      newCategories.splice(newIndex, 0, movedCategory);

      try {
        await reorderCategories(newCategories);
        showNotification('success', 'Ordem das categorias atualizada com sucesso!');
      } catch (error) {
        console.error('Error reordering categories:', error);
        showNotification('error', 'Erro ao reordenar categorias. Tente novamente.');
      }
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsAddingItem(true);
  };

  const handleAddItem = () => {
    setEditingItem(undefined);
    setIsAddingItem(true);
  };

  const handleSaveItem = async (item: MenuItem) => {
    try {
      setIsLoading(true);
      if (item.id) {
        await updateMenuItem(item);
        showNotification('success', 'Item atualizado com sucesso!');
      } else {
        await addMenuItem(item);
        showNotification('success', 'Item adicionado com sucesso!');
      }
      setIsAddingItem(false);
    } catch (error) {
      console.error('Error saving item:', error);
      showNotification('error', 'Erro ao salvar item. Tente novamente.');
      throw error; // Re-throw to let EditMenuItem handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        setIsLoading(true);
        await deleteMenuItem(id);
        showNotification('success', 'Item excluído com sucesso!');
      } catch (error) {
        console.error('Error deleting item:', error);
        showNotification('error', 'Erro ao excluir item. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        setIsLoading(true);
        await addCategory({ 
          name: newCategoryName.trim(),
          parentCategoryId: selectedParentCategory || null
        });
        setNewCategoryName('');
        setSelectedParentCategory('');
        setIsAddingCategory(false);
        showNotification('success', 'Categoria adicionada com sucesso!');
      } catch (error) {
        console.error('Error adding category:', error);
        showNotification('error', 'Erro ao adicionar categoria. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddSubcategory = (parentId: string) => {
    setSelectedParentCategory(parentId);
    setIsAddingCategory(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory({ 
      id: category.id, 
      name: category.name,
      parentCategoryId: category.parentCategoryId
    });
  };

  const handleSaveCategory = async () => {
    if (editingCategory && editingCategory.name.trim()) {
      try {
        setIsLoading(true);
        await updateCategory({ 
          id: editingCategory.id, 
          name: editingCategory.name.trim(),
          parentCategoryId: editingCategory.parentCategoryId
        });
        setEditingCategory(null);
        showNotification('success', 'Categoria atualizada com sucesso!');
      } catch (error) {
        console.error('Error updating category:', error);
        showNotification('error', 'Erro ao atualizar categoria. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Todos os itens desta categoria serão afetados.')) {
      try {
        setIsLoading(true);
        await deleteCategory(id);
        showNotification('success', 'Categoria excluída com sucesso!');
      } catch (error) {
        console.error('Error deleting category:', error);
        showNotification('error', 'Erro ao excluir categoria. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getItemsByCategory = (categoryId: string) => {
    return getMenuItemsByCategory(categoryId, false);
  };

  const renderCategoryOptions = (categories: Category[], level = 0): JSX.Element[] => {
    return categories.flatMap(category => [
      <option key={category.id} value={category.id}>
        {'  '.repeat(level) + category.name}
      </option>,
      ...renderCategoryOptions(getSubcategories(category.id), level + 1)
    ]);
  };

  const parentCategories = getParentCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#5c3d2e] mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">
            Gerencie os itens do cardápio adicionando, editando ou removendo produtos.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors w-full sm:w-auto justify-center"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Cardápio</span>
        </button>
      </div>

      <div className="mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-serif text-[#5c3d2e]">Categorias</h2>
          
          {isAddingCategory ? (
            <div className="flex flex-col space-y-2 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  disabled={isLoading}
                  className="p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 flex-1 disabled:bg-gray-100"
                  placeholder="Nome da categoria"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={isLoading}
                  className="px-2 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm whitespace-nowrap disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => {
                    setIsAddingCategory(false);
                    setSelectedParentCategory('');
                    setNewCategoryName('');
                  }}
                  disabled={isLoading}
                  className="px-2 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
              <select
                value={selectedParentCategory}
                onChange={(e) => setSelectedParentCategory(e.target.value)}
                disabled={isLoading}
                className="p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 w-full disabled:bg-gray-100"
              >
                <option value="">Categoria principal (sem pai)</option>
                {renderCategoryOptions(parentCategories)}
              </select>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-1.5 bg-[#5c3d2e] text-white rounded-md hover:bg-amber-800 text-sm w-full sm:w-auto justify-center disabled:opacity-50"
            >
              <Plus size={16} />
              <span>Nova Categoria</span>
            </button>
          )}
        </div>

        {editingCategory && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                disabled={isLoading}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSaveCategory}
                disabled={isLoading}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={() => setEditingCategory(null)}
                disabled={isLoading}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={parentCategories.map(cat => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {parentCategories.map((category) => (
                <SortableCategory
                  key={category.id}
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  onAddSubcategory={handleAddSubcategory}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  items={getItemsByCategory(category.id)}
                  subcategories={getSubcategories(category.id)}
                  getItemsByCategory={getItemsByCategory}
                  getSubcategories={getSubcategories}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif text-[#5c3d2e]">Itens do Cardápio</h2>
        <button
          onClick={handleAddItem}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1.5 bg-[#5c3d2e] text-white rounded-md hover:bg-amber-800 text-sm disabled:opacity-50"
        >
          <Plus size={16} />
          <span>Novo Item</span>
        </button>
      </div>

      {isAddingItem && (
        <EditMenuItem
          item={editingItem}
          onSave={handleSaveItem}
          onCancel={() => setIsAddingItem(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;