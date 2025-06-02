import { supabase } from './supabase';
import { MenuItem, Category } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const initializeStorage = async (): Promise<void> => {
  // Migration is now handled through Supabase migrations
};

export const uploadImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('menu-items')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('menu-items')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const deleteImage = async (url: string): Promise<void> => {
  const fileName = url.split('/').pop();
  if (!fileName) return;

  const { error } = await supabase.storage
    .from('menu-items')
    .remove([fileName]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const getMenuItems = async (): Promise<MenuItem[]> => {
  const { data: menuItems, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }

  return menuItems.map(item => ({
    ...item,
    id: item.id,
    category: item.category_id,
    imageUrl: item.image_url,
    isOnSale: item.is_on_sale,
    isMostRequested: item.is_most_requested
  }));
};

export const getCategories = async (): Promise<Category[]> => {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories;
};

export const addMenuItem = async (item: MenuItem): Promise<void> => {
  let imageUrl = item.imageUrl;

  if (item.imageFile) {
    imageUrl = await uploadImage(item.imageFile);
  }

  const { error } = await supabase
    .from('menu_items')
    .insert([{
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.category,
      image_url: imageUrl,
      sizes: item.sizes || [],
      is_on_sale: item.isOnSale || false,
      is_most_requested: item.isMostRequested || false
    }]);

  if (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
};

export const updateMenuItem = async (item: MenuItem): Promise<void> => {
  let imageUrl = item.imageUrl;

  if (item.imageFile) {
    // Delete old image if it exists
    if (item.imageUrl) {
      await deleteImage(item.imageUrl);
    }
    imageUrl = await uploadImage(item.imageFile);
  }

  const { error } = await supabase
    .from('menu_items')
    .update({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.category,
      image_url: imageUrl,
      sizes: item.sizes || [],
      is_on_sale: item.isOnSale || false,
      is_most_requested: item.isMostRequested || false
    })
    .eq('id', item.id);

  if (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  // Get the item first to check for image
  const { data: item } = await supabase
    .from('menu_items')
    .select('image_url')
    .eq('id', id)
    .single();

  if (item?.image_url) {
    await deleteImage(item.image_url);
  }

  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<void> => {
  try {
    const { data: maxOrderResult, error: maxOrderError } = await supabase
      .from('categories')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxOrderError) {
      console.error('Error fetching max order:', maxOrderError);
      throw maxOrderError;
    }

    const newOrder = maxOrderResult ? (maxOrderResult.order + 1) : 0;

    const { error: insertError } = await supabase
      .from('categories')
      .insert([{
        name: category.name,
        order: newOrder
      }]);

    if (insertError) {
      console.error('Error adding category:', insertError);
      throw insertError;
    }
  } catch (error) {
    console.error('Error in addCategory:', error);
    throw error;
  }
};

export const updateCategory = async (category: Category): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .update({
      name: category.name
    })
    .eq('id', category.id);

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const reorderCategories = async (categories: Category[]): Promise<void> => {
  const updates = categories.map((category, index) => ({
    id: category.id,
    order: index
  }));

  const { error } = await supabase
    .from('categories')
    .upsert(updates, { onConflict: 'id' });

  if (error) {
    console.error('Error reordering categories:', error);
    throw error;
  }
};

export const authenticateUser = async (email: string, password: string): Promise<boolean> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Error authenticating:', error);
    return false;
  }

  return !!data.user;
};