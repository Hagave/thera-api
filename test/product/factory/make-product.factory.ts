import { v4 as uuidv4 } from 'uuid';
import { Product } from '@domain/product/entities/product.entity';
import { Money } from '@shared/value-objects/money.vo';

type MakeProductInput = {
  id?: string;
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export function makeProduct(input: MakeProductInput = {}): Product {
  return new Product({
    id: input.id ?? uuidv4(),
    name: input.name ?? 'Product Name',
    category: input.category ?? 'Category',
    description: input.description ?? 'Description',
    price: new Money(input.price ?? 100),
    stock: input.stock ?? 10,
    createdAt: input.createdAt ?? new Date(),
    updatedAt: input.updatedAt ?? new Date(),
    deletedAt: input.deletedAt,
  });
}
