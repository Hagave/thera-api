import { ListProductsUseCase } from '@application/usecases/product/list/list-products.use-case';
import { Product } from '@domain/product/entities/product.entity';
import { InMemoryProductRepository } from '@infrastructure/repositories/in-memory/in-memory.product.repository';
import { Money } from '@shared/value-objects/money.vo';
import { v4 as uuidv4 } from 'uuid';
import { describe, beforeEach, it, expect } from 'vitest';
import { makeProduct } from './factory/make-product.factory';

describe('ListProductsUseCase', () => {
  let productRepository: InMemoryProductRepository;
  let useCase: ListProductsUseCase;

  beforeEach(() => {
    productRepository = new InMemoryProductRepository();
    useCase = new ListProductsUseCase(productRepository);
  });

  it('should list products with pagination', async () => {
    const products = [makeProduct(), makeProduct(), makeProduct()];
    for (const p of products) {
      await productRepository.create(p);
    }

    const result = await useCase.execute({ page: 1, limit: 2 });

    expect(result.products).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(Math.ceil(3 / 2));
  });

  it('should apply filters correctly', async () => {
    const p1 = makeProduct({ name: 'Apple', category: 'Fruits' });
    const p2 = makeProduct({ name: 'Banana', category: 'Fruits' });
    const p3 = makeProduct({ name: 'Carrot', category: 'Vegetables' });

    await productRepository.create(p1);
    await productRepository.create(p2);
    await productRepository.create(p3);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      category: 'Fruits',
      name: 'a', // deve pegar "Apple" e "Banana"
    });

    expect(result.products).toHaveLength(2);
    expect(result.products.map((p) => p.id)).toEqual(
      expect.arrayContaining([p1.getId(), p2.getId()]),
    );
    expect(result.total).toBe(2);
  });

  it('should return empty list if no products match', async () => {
    const result = await useCase.execute({ page: 1, limit: 5, category: 'Nonexistent' });

    expect(result.products).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(5);
    expect(result.totalPages).toBe(0);
  });
});
