import { supabase } from './supabase';
import { MenuItem, Category, Profile } from '../types';
import { v4 as uuidv4 } from 'uuid';

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

  return categories.map(category => ({
    id: category.id,
    name: category.name,
    order: category.order,
    parentCategoryId: category.parent_category_id
  }));
};

export const addMenuItem = async (item: MenuItem): Promise<MenuItem> => {
  let imageUrl = item.imageUrl;

  if (item.imageFile) {
    imageUrl = await uploadImage(item.imageFile);
  }

  const { data, error } = await supabase
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
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category_id,
    imageUrl: data.image_url,
    sizes: data.sizes,
    isOnSale: data.is_on_sale,
    isMostRequested: data.is_most_requested
  };
};

export const updateMenuItem = async (item: MenuItem): Promise<MenuItem> => {
  let imageUrl = item.imageUrl;

  if (item.imageFile) {
    // Delete old image if it exists
    if (item.imageUrl) {
      await deleteImage(item.imageUrl);
    }
    imageUrl = await uploadImage(item.imageFile);
  }

  const { data, error } = await supabase
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
    .eq('id', item.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category_id,
    imageUrl: data.image_url,
    sizes: data.sizes,
    isOnSale: data.is_on_sale,
    isMostRequested: data.is_most_requested
  };
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

export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
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

    const { data, error: insertError } = await supabase
      .from('categories')
      .insert([{
        name: category.name,
        order: newOrder,
        parent_category_id: category.parentCategoryId
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error adding category:', insertError);
      throw insertError;
    }

    return {
      id: data.id,
      name: data.name,
      order: data.order,
      parentCategoryId: data.parent_category_id
    };
  } catch (error) {
    console.error('Error in addCategory:', error);
    throw error;
  }
};

export const updateCategory = async (category: Category): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update({
      name: category.name,
      parent_category_id: category.parentCategoryId
    })
    .eq('id', category.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    order: data.order,
    parentCategoryId: data.parent_category_id
  };
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

// User Profile Management Functions

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    role: data.role,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const getAllWaiters = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'waiter')
    .order('name');

  if (error) {
    console.error('Error fetching waiters:', error);
    return [];
  }

  return data.map(profile => ({
    id: profile.id,
    name: profile.name,
    role: profile.role,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at
  }));
};

export const getAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return data.map(profile => ({
    id: profile.id,
    name: profile.name,
    role: profile.role,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at
  }));
};

export const createWaiter = async (waiterData: {
  name: string;
  email: string;
  password: string;
}): Promise<Profile> => {
  // Create user in auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: waiterData.email,
    password: waiterData.password,
    options: {
      data: {
        name: waiterData.name,
        role: 'waiter'
      }
    }
  });

  if (authError) {
    console.error('Error creating waiter auth:', authError);
    throw authError;
  }

  if (!authData.user) {
    throw new Error('Failed to create user');
  }

  // The profile will be created automatically by the database trigger
  // We use setTimeout as a workaround to ensure the trigger has time to execute
  // In a production environment, consider implementing a more robust polling mechanism
  // or using real-time subscriptions to detect when the profile is created
  await new Promise(resolve => setTimeout(resolve, 1000));

  const profile = await getUserProfile(authData.user.id);
  if (!profile) {
    throw new Error('Failed to create waiter profile');
  }

  return profile;
};

export const updateProfile = async (profileData: {
  id: string;
  name: string;
  role: 'admin' | 'waiter';
}): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: profileData.name,
      role: profileData.role
    })
    .eq('id', profileData.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    role: data.role,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const deleteWaiter = async (waiterId: string): Promise<void> => {
  // Delete from auth.users (this will cascade to profiles)
  const { error } = await supabase.auth.admin.deleteUser(waiterId);

  if (error) {
    console.error('Error deleting waiter:', error);
    throw error;
  }
};