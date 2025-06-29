import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, Category } from '../../types';
import { useMenu } from '../../hooks/useMenu';
import { X, Plus, Trash, Upload, AlertCircle, FolderOpen, Folder } from 'lucide-react';

interface EditMenuItemProps {
  item?: MenuItem;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
}

const defaultMenuItem: MenuItem = {
  id: '',
  name: '',
  description: '',
  price: 0,
  category: '',
  imageUrl: '',
  sizes: [],
  isOnSale: false,
  isMostRequested: false
};

const EditMenuItem: React.FC<EditMenuItemProps> = ({ 
  item, 
  onSave, 
  onCancel 
}) => {
  const { getAllCategories, getSubcategories, getCategoryHierarchy } = useMenu();
  const [formData, setFormData] = useState<MenuItem>(item || defaultMenuItem);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSize, setNewSize] = useState({ size: '', price: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = getAllCategories();

  useEffect(() => {
    if (item) {
      setFormData(item);
      if (item.imageUrl) {
        setImagePreview(item.imageUrl);
      }
    } else {
      if (categories.length > 0) {
        setFormData({ ...defaultMenuItem, category: categories[0].id });
      }
    }
  }, [item, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'price') {
      const numValue = value === '' ? 0 : parseFloat(value);
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors({ ...errors, image: 'A imagem deve ter no máximo 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setFormData({ ...formData, imageFile: file });
      setErrors({ ...errors, image: '' });
    }
  };

  const handleAddSize = () => {
    if (newSize.size && newSize.price !== '') {
      const price = parseFloat(newSize.price);
      if (!isNaN(price) && price >= 0) {
        setFormData({
          ...formData,
          sizes: [...(formData.sizes || []), { size: newSize.size, price }]
        });
        setNewSize({ size: '', price: '' });
      }
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes?.filter(s => s.size !== sizeToRemove) || []
    });
  };

  const renderCategoryOptions = (categories: Category[], level = 0): JSX.Element[] => {
    const parentCategories = categories.filter(cat => !cat.parentCategoryId);
    
    const renderCategory = (category: Category, currentLevel: number): JSX.Element[] => {
      const subcategories = getSubcategories(category.id);
      const indent = '  '.repeat(currentLevel);
      const icon = currentLevel === 0 ? '📁 ' : '📂 ';
      
      return [
        <option key={category.id} value={category.id}>
          {indent + icon + category.name}
        </option>,
        ...subcategories.flatMap(subcat => renderCategory(subcat, currentLevel + 1))
      ];
    };

    return parentCategories.flatMap(category => renderCategory(category, level));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    // Only validate base price if no sizes are defined
    if ((!formData.sizes || formData.sizes.length === 0) && formData.price <= 0) {
      newErrors.price = 'Preço base é obrigatório quando não há tamanhos definidos';
    }
    
    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving menu item:', error);
      setSubmitError('Erro ao salvar o item. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-serif text-[#532b1b]">
              {item ? 'Editar Item' : 'Novo Item'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {item ? 'Modifique as informações do item' : 'Adicione um novo item ao cardápio'}
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>
        
        {submitError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{submitError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Item *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100`}
                  placeholder="Ex: Pizza Margherita"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  disabled={isSubmitting}
                  className={`w-full p-3 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100`}
                  placeholder="Descreva os ingredientes e características do item..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full p-3 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100`}
                >
                  <option value="">Selecionar categoria</option>
                  {renderCategoryOptions(categories)}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                {formData.category && (
                  <p className="mt-1 text-xs text-gray-500">
                    Hierarquia: {getCategoryHierarchy(formData.category)}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Base (R$)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full p-3 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100`}
                  placeholder="0.00"
                />
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Deixe em branco se usar apenas tamanhos personalizados
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opções de Tamanho
                </label>
                <div className="space-y-2 mb-3">
                  {formData.sizes?.map((size) => (
                    <div key={size.size} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="flex-1 text-sm">
                        <strong>{size.size}</strong> - R$ {size.price.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(size.size)}
                        disabled={isSubmitting}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSize.size}
                    onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                    placeholder="Tamanho (ex: P, M, G)"
                    disabled={isSubmitting}
                    className="flex-1 p-2 border border-gray-300 rounded-lg disabled:bg-gray-100 text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newSize.price}
                    onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                    placeholder="Preço"
                    disabled={isSubmitting}
                    className="w-20 p-2 border border-gray-300 rounded-lg disabled:bg-gray-100 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    disabled={isSubmitting}
                    className="bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isOnSale"
                    name="isOnSale"
                    checked={formData.isOnSale}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500 disabled:opacity-50"
                  />
                  <label htmlFor="isOnSale" className="ml-2 text-sm text-gray-700">
                    Item em promoção
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isMostRequested"
                    name="isMostRequested"
                    checked={formData.isMostRequested}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500 disabled:opacity-50"
                  />
                  <label htmlFor="isMostRequested" className="ml-2 text-sm text-gray-700">
                    Item mais pedido
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem do Item
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-40 w-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, imageUrl: '', imageFile: undefined });
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      disabled={isSubmitting}
                      className="absolute top-0 right-0 -mr-2 -mt-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className={`relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
                      >
                        <span>Carregar imagem</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          ref={fileInputRef}
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isSubmitting}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF até 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>
            {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
          </div>
          
          <div className="flex gap-3 justify-end mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm bg-[#532b1b] text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuItem;