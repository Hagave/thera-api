import { Product } from '../entities/product.entity';

export interface IProductFilters {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findByNameAndCategory(name: string, category: string): Promise<Product | null>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
  list(
    page: number,
    limit: number,
    filters?: IProductFilters,
  ): Promise<{ products: Product[]; total: number }>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
