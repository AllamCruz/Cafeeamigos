import React, { useState } from 'react';
import { useMenu } from '../../hooks/useMenu';
import { MenuItem, Category } from '../../types';
import EditMenuItem from './EditMenuItem';
import CategoryManager from './CategoryManager';
import WaiterManager from './WaiterManager';
import { Edit, Trash, Plus, ArrowLeft, GripVertical, ChevronRight, ChevronDown, AlertCircle, CheckCircle, X, FolderOpen, Folder, Package, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableCategoryProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onAddItemToCategory: (categoryId: string) => void;
  items: MenuItem[];
  subcategories: Category[];
  level?: number;
}

const SortableCategory: React.FC<SortableCategoryProps> = ({ 
  category, 
  onEdit, 
  onDelete,
  onEditItem,
  onDeleteItem,
  onAddItemToCategory,
  items,
  subcategories,
  level = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
    zIndex: isDragging ? 1 : 0
  };

  const hasContent = items.length > 0 || subcategories.length > 0;
  const indentClass = level > 0 ? `ml-${level * 6}` : '';

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white border border-amber-100 rounded-lg p-4 shadow-sm flex justify-between items-center mb-2 ${
          isDragging ? 'opacity-50' : ''
        } ${indentClass}`}
      >
        <div className="flex items-center flex-1">
          {hasContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 mr-2"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          
          <button
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mr-2"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          
          <div className="flex items-center">
            {level === 0 ? (
              <FolderOpen className="h-4 w-4 text-amber-600 mr-2" />
            ) : (
              <Folder className="h-4 w-4 text-amber-500 mr-2" />
            )}
            <span className="font-medium text-gray-900">{category.name}</span>
            {level > 0 && (
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Subcategoria
              </span>
            )}
          </div>
          
          <div className="ml-4 flex items-center space-x-2">
            {subcategories.length > 0 && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center">
                <Folder size={12} className="mr-1" />
                {subcategories.length} sub
              </span>
            )}
            {items.length > 0 && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                <Package size={12} className="mr-1" />
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => onAddItemToCategory(category.id)}
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
            title="Adicionar item nesta categoria"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            title="Editar categoria"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            title="Excluir categoria"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {isExpanded && hasContent && (
        <div className={`mb-4 ${indentClass}`}>
          {/* Render subcategories first */}
          {subcategories.map((subcategory) => (
            <SortableCategory
              key={subcategory.id}
              category={subcategory}
              onEdit={onEdit}
              onDelete={onDelete}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
              onAddItemToCategory={onAddItemToCategory}
              items={items.filter(item => item.category === subcategory.id)}
              subcategories={[]}
              level={level + 1}
            />
          ))}
          
          {/* Render items */}
          {items.filter(item => item.category === category.id).length > 0 && (
            <div className="ml-6 mb-2">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Package size={14} className="mr-2" />
                    Itens da categoria
                  </h4>
                  <button
                    onClick={() => onAddItemToCategory(category.id)}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Plus size={12} className="mr-1" />
                    Adicionar Item
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Descrição
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preço
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.filter(item => item.category === category.id).map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.imageUrl && (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name} 
                                  className="h-12 w-12 rounded-lg mr-3 object-cover border border-gray-200"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.sizes && item.sizes.length > 0 ? `${item.sizes.length} tamanhos` : 'Tamanho único'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell">
                            <div className="text-sm text-gray-500 truncate max-w-[200px] lg:max-w-[300px]">
                              {item.description}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.sizes && item.sizes.length > 0 
                                ? `A partir de R$ ${Math.min(...item.sizes.map(s => s.price)).toFixed(2)}`
                                : `R$ ${item.price.toFixed(2)}`
                              }
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex space-x-1">
                              {item.isMostRequested && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Popular
                                </span>
                              )}
                              {item.isOnSale && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Promoção
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => onEditItem(item)}
                                className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors"
                                title="Editar item"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => onDeleteItem(item.id)}
                                className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                                title="Excluir item"
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
            </div>
          )}
        </div>
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
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 max-w-md ${
      type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
      )}
      <span className={`text-sm ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
        {message}
      </span>
      <button
        onClick={onClose}
        className={`ml-2 flex-shrink-0 ${type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}`}
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
  const [initialCategoryId, setInitialCategoryId] = useState<string>('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showWaiterManager, setShowWaiterManager] = useState(false);
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
    setInitialCategoryId('');
    setIsAddingItem(true);
  };

  const handleAddItemToCategory = (categoryId: string) => {
    setEditingItem(undefined);
    setInitialCategoryId(categoryId);
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
      throw error;
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

  const handleEditCategory = (category: Category) => {
    setShowCategoryManager(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    const subcategories = getSubcategories(id);
    const items = getMenuItemsByCategory(id, true);
    
    let confirmMessage = `Tem certeza que deseja excluir a categoria "${category?.name}"?`;
    
    if (subcategories.length > 0) {
      confirmMessage += `\n\nEsta ação também excluirá ${subcategories.length} subcategoria(s).`;
    }
    
    if (items.length > 0) {
      confirmMessage += `\n\nEsta ação afetará ${items.length} item(ns) do cardápio.`;
    }

    if (window.confirm(confirmMessage)) {
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

      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#532b1b] mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">
            Gerencie categorias, subcategorias, itens do cardápio e garçons de forma profissional.
          </p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <FolderOpen size={14} className="mr-1" />
              {parentCategories.length} categorias principais
            </span>
            <span className="flex items-center">
              <Package size={14} className="mr-1" />
              {menuItems.length} itens no cardápio
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors w-full lg:w-auto justify-center"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Cardápio</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setShowCategoryManager(true)}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#532b1b] text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
        >
          <FolderOpen size={18} />
          <span>Gerenciar Categorias</span>
        </button>
        
        <button
          onClick={() => setShowWaiterManager(true)}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Users size={18} />
          <span>Gerenciar Garçons</span>
        </button>
      </div>

      {/* Categories Overview */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-[#532b1b]">Estrutura do Cardápio</h2>
          <div className="text-sm text-gray-500 bg-amber-50 px-3 py-1 rounded-full flex items-center">
            <ChevronRight size={12} className="mr-1" />
            Clique nas setas para expandir as categorias
          </div>
        </div>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={parentCategories.map(cat => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {parentCategories.map((category) => (
                <SortableCategory
                  key={category.id}
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  onAddItemToCategory={handleAddItemToCategory}
                  items={getMenuItemsByCategory(category.id, true)}
                  subcategories={getSubcategories(category.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Modals */}
      {isAddingItem && (
        <EditMenuItem
          item={editingItem}
          initialCategoryId={initialCategoryId}
          onSave={handleSaveItem}
          onCancel={() => setIsAddingItem(false)}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          onClose={() => setShowCategoryManager(false)}
          onSuccess={(message) => showNotification('success', message)}
          onError={(message) => showNotification('error', message)}
        />
      )}

      {showWaiterManager && (
        <WaiterManager
          onClose={() => setShowWaiterManager(false)}
          onSuccess={(message) => showNotification('success', message)}
          onError={(message) => showNotification('error', message)}
        />
      )}
    </div>
  );
};

export default AdminPanel;