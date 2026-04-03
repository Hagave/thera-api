export interface IListProductsInput {
  page: number;
  limit: number;
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface IListProductsOutput {
  products: {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    stock: number;
    createdAt: Date;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
