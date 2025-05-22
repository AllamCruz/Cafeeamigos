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
  subcategories?: Category[];
}

export interface User {
  username: string;
  password: string;
}