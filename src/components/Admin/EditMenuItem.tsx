import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, Category } from '../../types';
import { X, Plus, Trash, Upload } from 'lucide-react';

interface EditMenuItemProps {
  item?: MenuItem;
  categories: Category[];
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
  categories, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<MenuItem>(item || defaultMenuItem);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSize, setNewSize] = useState({ size: '', price: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    return categories.flatMap(category => [
      <option key={category.id} value={category.id}>
        {'  '.repeat(level) + category.name}
      </option>,
      ...(category.subcategories ? renderCategoryOptions(category.subcategories, level + 1) : [])
    ]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium text-[#5c3d2e]">
            {item ? 'Editar Item' : 'Novo Item'}
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full p-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
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
              className={`w-full p-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500`}
              placeholder="0.00"
            />
            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opções de Tamanho
            </label>
            <div className="space-y-2">
              {formData.sizes?.map((size) => (
                <div key={size.size} className="flex items-center gap-2">
                  <span className="flex-1 bg-gray-50 px-3 py-2 rounded-md">
                    {size.size} - R$ {size.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(size.size)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newSize.size}
                onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                placeholder="Tamanho (ex: P, M, G)"
                className="flex-1 p-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={newSize.price}
                onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                placeholder="Preço"
                className="w-24 p-2 border border-gray-300 rounded-md"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="bg-amber-500 text-white p-2 rounded-md hover:bg-amber-600"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500`}
            >
              <option value="">Selecionar categoria</option>
              {renderCategoryOptions(categories)}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-32 w-32 object-cover rounded-md"
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
                      className="absolute top-0 right-0 -mr-2 -mt-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
                        className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500"
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

          <div className="mb-4 space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOnSale"
                name="isOnSale"
                checked={formData.isOnSale}
                onChange={handleChange}
                className="h-4 w-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
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
                className="h-4 w-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
              />
              <label htmlFor="isMostRequested" className="ml-2 text-sm text-gray-700">
                Item mais pedido
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-[#5c3d2e] text-white rounded-md hover:bg-amber-800 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuItem;