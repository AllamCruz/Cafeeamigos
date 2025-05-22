export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  sizes?: { size: string; price: number }[];
  isOnSale?: boolean;
  isMostRequested?: boolean;
}

export interface Category {
  id: string;
  name: string;
  order?: number;
}

export interface User {
  username: string;
  password: string;
}