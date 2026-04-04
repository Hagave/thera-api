import {
  IProductRepository,
  IProductFilters,
} from '@domain/product/repositories/product.repository';
import { Product } from '@domain/product/entities/product.entity';

export class InMemoryProductRepository implements IProductRepository {
  private products = new Map<string, Product>();

  async create(product: Product): Promise<Product> {
    this.products.set(product.getId(), product);
    return product;
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.products.get(id);

    if (!product || product.isDeleted()) {
      return null;
    }

    return product;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    return ids
      .map((id) => this.products.get(id))
      .filter((p): p is Product => !!p && !p.isDeleted());
  }

  async findByNameAndCategory(name: string, category: string): Promise<Product | null> {
    for (const product of this.products.values()) {
      if (
        !product.isDeleted() &&
        product.getName() === name &&
        product.getCategory() === category
      ) {
        return product;
      }
    }
    return null;
  }

  async update(product: Product): Promise<Product> {
    this.products.set(product.getId(), product);
    return product;
  }

  async delete(id: string): Promise<void> {
    const product = this.products.get(id);

    if (product) {
      product.delete();
      this.products.set(id, product);
    }
  }

  async list(
    page: number,
    limit: number,
    filters?: IProductFilters,
  ): Promise<{ products: Product[]; total: number }> {
    let items = Array.from(this.products.values()).filter((p) => !p.isDeleted());

    // filtros básicos
    if (filters?.name) {
      items = items.filter((p) => p.getName().toLowerCase().includes(filters.name!.toLowerCase()));
    }

    if (filters?.category) {
      items = items.filter((p) => p.getCategory() === filters.category);
    }

    if (filters?.minPrice !== undefined) {
      items = items.filter((p) => p.getPrice().getAmount() >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      items = items.filter((p) => p.getPrice().getAmount() <= filters.maxPrice!);
    }

    if (filters?.minStock !== undefined) {
      items = items.filter((p) => p.getStock() >= filters.minStock!);
    }

    // ordenação
    if (filters?.sortBy) {
      items.sort((a, b) => {
        const order = filters.sortOrder === 'desc' ? -1 : 1;

        switch (filters.sortBy) {
          case 'name':
            return a.getName().localeCompare(b.getName()) * order;
          case 'price':
            return (a.getPrice().getAmount() - b.getPrice().getAmount()) * order;
          case 'createdAt':
            return (a.getCreatedAt().getTime() - b.getCreatedAt().getTime()) * order;
          default:
            return 0;
        }
      });
    }

    const total = items.length;

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      products: items.slice(start, end),
      total,
    };
  }
}
