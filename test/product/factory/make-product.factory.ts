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

export function makeProduct(
  props?: Partial<{
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
  }>,
): Product {
  return new Product({
    id: props?.id ?? uuidv4(),
    name: props?.name ?? 'Product ' + Math.random(),
    category: props?.category ?? 'Category 1',
    description: props?.description ?? 'Test product',
    price: new Money(props?.price ?? 100),
    stock: props?.stock ?? 10,
    createdAt: props?.createdAt ?? new Date(),
    updatedAt: props?.updatedAt ?? new Date(),
  });
}
