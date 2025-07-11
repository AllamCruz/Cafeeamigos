import { useState, useEffect } from 'react';
import { MenuItem, Category } from '../types';
import {
  getMenuItems,
  getCategories,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories as reorderCategoriesStorage
} from '../utils/storage';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, cats] = await Promise.all([
        getMenuItems(),
        getCategories()
      ]);
      setMenuItems(items);
      setCategories(cats);
      setError(null);
    } catch (err) {
      setError('Failed to load menu data');
      console.error('Error loading menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMenuItemsByCategory = (categoryId: string, includeSubcategories: boolean = true): MenuItem[] => {
    if (!includeSubcategories) {
      return menuItems.filter(item => item.category === categoryId);
    }

    // Get items from the category and all its subcategories
    const subcategoryIds = getSubcategories(categoryId).map(sub => sub.id);
    const allCategoryIds = [categoryId, ...subcategoryIds];
    
    return menuItems.filter(item => allCategoryIds.includes(item.category));
  };

  const getCategoryById = (categoryId: string): Category | undefined => {
    return categories.find(cat => cat.id === categoryId);
  };

  const getAllCategories = (): Category[] => {
    return categories;
  };

  const getParentCategories = (): Category[] => {
    return categories.filter(category => !category.parentCategoryId);
  };

  const getSubcategories = (parentId: string): Category[] => {
    return categories.filter(category => category.parentCategoryId === parentId);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = getCategoryById(categoryId);
    return category ? category.name : '';
  };

  const getCategoryHierarchy = (categoryId: string): string => {
    const category = getCategoryById(categoryId);
    if (!category) return '';
    
    if (category.parentCategoryId) {
      const parent = getCategoryById(category.parentCategoryId);
      return parent ? `${parent.name} > ${category.name}` : category.name;
    }
    
    return category.name;
  };

  const handleAddMenuItem = async (item: MenuItem) => {
    try {
      const newItem = await addMenuItem(item);
      setMenuItems(prevItems => [...prevItems, newItem]);
    } catch (err) {
      setError('Failed to add menu item');
      throw err;
    }
  };

  const handleUpdateMenuItem = async (item: MenuItem) => {
    try {
      const updatedItem = await updateMenuItem(item);
      setMenuItems(prevItems => 
        prevItems.map(prevItem => 
          prevItem.id === updatedItem.id ? updatedItem : prevItem
        )
      );
    } catch (err) {
      setError('Failed to update menu item');
      throw err;
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await deleteMenuItem(id);
      setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete menu item');
      throw err;
    }
  };

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory = await addCategory(category);
      setCategories(prevCategories => [...prevCategories, newCategory]);
    } catch (err) {
      setError('Failed to add category');
      throw err;
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    try {
      const updatedCategory = await updateCategory(category);
      setCategories(prevCategories => 
        prevCategories.map(prevCategory => 
          prevCategory.id === updatedCategory.id ? updatedCategory : prevCategory
        )
      );
    } catch (err) {
      setError('Failed to update category');
      throw err;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
      setMenuItems(prevItems => prevItems.filter(item => item.category !== id));
    } catch (err) {
      setError('Failed to delete category');
      throw err;
    }
  };

  const handleReorderCategories = async (newCategories: Category[]): Promise<void> => {
    try {
      await reorderCategoriesStorage(newCategories);
      setCategories(newCategories);
    } catch (err) {
      setError('Failed to reorder categories');
      throw err;
    }
  };

  return {
    menuItems,
    categories,
    loading,
    error,
    getMenuItemsByCategory,
    getCategoryById,
    getAllCategories,
    getParentCategories,
    getSubcategories,
    getCategoryName,
    getCategoryHierarchy,
    addMenuItem: handleAddMenuItem,
    updateMenuItem: handleUpdateMenuItem,
    deleteMenuItem: handleDeleteMenuItem,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    reorderCategories: handleReorderCategories
  };
};