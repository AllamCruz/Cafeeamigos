export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  imageFile?: File;
  sizes?: { size: string; price: number }[];
  isOnSale?: boolean;
  isMostRequested?: boolean;
}

export interface Category {
  id: string;
  name: string;
  order?: number;
  parentCategoryId?: string | null;
}

export interface User {
  username: string;
  password: string;
}

export interface Profile {
  id: string;
  name: string;
  role: 'admin' | 'waiter';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  waiterName: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  totalAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  priceAtOrder: number;
  sizeSelected?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields when joining with menu_items
  menuItem?: MenuItem;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: string;
  notes?: string;
  price: number; // Final price considering size selection
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};