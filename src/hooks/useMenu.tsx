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

  const getAllSubcategoryIds = (categoryId: string): string[] => {
    const findSubcategoryIds = (catId: string, acc: string[] = []): string[] => {
      const category = categories.find(c => c.id === catId);
      if (!category) return acc;

      acc.push(category.id);
      
      // Find all direct subcategories
      const subcategories = categories.filter(c => c.parentCategoryId === category.id);
      subcategories.forEach(subcat => {
        findSubcategoryIds(subcat.id, acc);
      });

      return acc;
    };

    return findSubcategoryIds(categoryId);
  };

  const getMenuItemsByCategory = (categoryId: string, includeSubcategories: boolean = true): MenuItem[] => {
    if (!includeSubcategories) {
      return menuItems.filter(item => item.category === categoryId);
    }

    const categoryIds = getAllSubcategoryIds(categoryId);
    return menuItems.filter(item => categoryIds.includes(item.category));
  };

  const getCategoryById = (categoryId: string): Category | undefined => {
    return categories.find(cat => cat.id === categoryId);
  };

  const getParentCategories = (): Category[] => {
    return categories.filter(cat => !cat.parentCategoryId);
  };

  const getSubcategories = (parentId: string): Category[] => {
    return categories.filter(cat => cat.parentCategoryId === parentId);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = getCategoryById(categoryId);
    return category ? category.name : '';
  };

  const handleAddMenuItem = async (item: MenuItem) => {
    try {
      await addMenuItem(item);
      const updatedItems = await getMenuItems();
      setMenuItems(updatedItems);
    } catch (err) {
      setError('Failed to add menu item');
      throw err;
    }
  };

  const handleUpdateMenuItem = async (item: MenuItem) => {
    try {
      await updateMenuItem(item);
      const updatedItems = await getMenuItems();
      setMenuItems(updatedItems);
    } catch (err) {
      setError('Failed to update menu item');
      throw err;
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await deleteMenuItem(id);
      const updatedItems = await getMenuItems();
      setMenuItems(updatedItems);
    } catch (err) {
      setError('Failed to delete menu item');
      throw err;
    }
  };

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    try {
      await addCategory(category);
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
    } catch (err) {
      setError('Failed to add category');
      throw err;
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    try {
      await updateCategory(category);
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
    } catch (err) {
      setError('Failed to update category');
      throw err;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      const [updatedItems, updatedCategories] = await Promise.all([
        getMenuItems(),
        getCategories()
      ]);
      setMenuItems(updatedItems);
      setCategories(updatedCategories);
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
    getParentCategories,
    getSubcategories,
    getCategoryName,
    addMenuItem: handleAddMenuItem,
    updateMenuItem: handleUpdateMenuItem,
    deleteMenuItem: handleDeleteMenuItem,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    reorderCategories: handleReorderCategories
  };
};