import { supabase } from './supabase';
import { MenuItem, Category, Order, OrderItem, OrderWithItems, CartItem, Profile } from '../types';
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

  // The profile will be created automatically by the trigger
  // Wait a moment and then fetch the profile
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

// Order Management Functions

export const addOrder = async (orderData: {
  tableNumber: string;
  waiterName: string;
  notes?: string;
}): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      table_number: orderData.tableNumber,
      waiter_name: orderData.waiterName,
      notes: orderData.notes,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding order:', error);
    throw error;
  }

  return {
    id: data.id,
    tableNumber: data.table_number,
    waiterName: data.waiter_name,
    status: data.status,
    totalAmount: data.total_amount,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const addOrderItems = async (items: Array<{
  orderId: string;
  menuItemId: string;
  quantity: number;
  priceAtOrder: number;
  sizeSelected?: string;
  notes?: string;
}>): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from('order_items')
    .insert(items.map(item => ({
      order_id: item.orderId,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      price_at_order: item.priceAtOrder,
      size_selected: item.sizeSelected,
      notes: item.notes
    })))
    .select();

  if (error) {
    console.error('Error adding order items:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    orderId: item.order_id,
    menuItemId: item.menu_item_id,
    quantity: item.quantity,
    priceAtOrder: item.price_at_order,
    sizeSelected: item.size_selected,
    notes: item.notes,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
};

export const createOrderWithItems = async (
  orderData: {
    tableNumber: string;
    waiterName: string;
    notes?: string;
  },
  cartItems: CartItem[]
): Promise<OrderWithItems> => {
  // Calculate total amount
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Create the order
  const order = await addOrder({ ...orderData });

  // Add order items
  const orderItems = await addOrderItems(
    cartItems.map(item => ({
      orderId: order.id,
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
      priceAtOrder: item.price,
      sizeSelected: item.selectedSize,
      notes: item.notes
    }))
  );

  // Update order with total amount
  await updateOrderTotalAmount(order.id, totalAmount);

  return {
    ...order,
    totalAmount,
    items: orderItems
  };
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updateOrderTotalAmount = async (orderId: string, totalAmount: number): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .update({ total_amount: totalAmount })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order total amount:', error);
    throw error;
  }
};

export const getOrders = async (status?: string): Promise<Order[]> => {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data.map(order => ({
    id: order.id,
    tableNumber: order.table_number,
    waiterName: order.waiter_name,
    status: order.status,
    totalAmount: order.total_amount,
    notes: order.notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at
  }));
};

export const getOrderDetails = async (orderId: string): Promise<OrderWithItems | null> => {
  // Get order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError) {
    console.error('Error fetching order:', orderError);
    return null;
  }

  // Get order items with menu item details
  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      *,
      menu_items (*)
    `)
    .eq('order_id', orderId);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    return null;
  }

  const order: Order = {
    id: orderData.id,
    tableNumber: orderData.table_number,
    waiterName: orderData.waiter_name,
    status: orderData.status,
    totalAmount: orderData.total_amount,
    notes: orderData.notes,
    createdAt: orderData.created_at,
    updatedAt: orderData.updated_at
  };

  const items: OrderItem[] = itemsData.map(item => ({
    id: item.id,
    orderId: item.order_id,
    menuItemId: item.menu_item_id,
    quantity: item.quantity,
    priceAtOrder: item.price_at_order,
    sizeSelected: item.size_selected,
    notes: item.notes,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    menuItem: item.menu_items ? {
      id: item.menu_items.id,
      name: item.menu_items.name,
      description: item.menu_items.description,
      price: item.menu_items.price,
      category: item.menu_items.category_id,
      imageUrl: item.menu_items.image_url,
      sizes: item.menu_items.sizes,
      isOnSale: item.menu_items.is_on_sale,
      isMostRequested: item.menu_items.is_most_requested
    } : undefined
  }));

  return {
    ...order,
    items
  };
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const getOrdersByStatus = async (status: string): Promise<Order[]> => {
  return getOrders(status);
};

export const getOrdersCount = async (): Promise<{ [key: string]: number }> => {
  const { data, error } = await supabase
    .from('orders')
    .select('status');

  if (error) {
    console.error('Error fetching orders count:', error);
    return {};
  }

  const counts = data.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  return counts;
};