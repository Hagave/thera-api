import { describe, it, expect, beforeEach } from 'vitest';
import { ProductNotFoundException } from '@domain/product/exceptions/product-not-found.exception';
import { ProductAlreadyExistsException } from '@domain/product/exceptions/product-already-exists.exception';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { InMemoryProductRepository } from '@infrastructure/repositories/in-memory/in-memory.product.repository';
import { UpdateProductUseCase } from '@application/usecases/product/update/update-product.use-case';
import { makeProduct } from './factory/make-product.factory';

let productRepository: InMemoryProductRepository;
let useCase: UpdateProductUseCase;

describe('UpdateProductUseCase', () => {
  beforeEach(() => {
    productRepository = new InMemoryProductRepository();
    useCase = new UpdateProductUseCase(productRepository);
  });

  it('should update product name, category, description, price, and stock', async () => {
    const product = makeProduct({ name: 'Old Name', category: 'Old Cat', price: 100, stock: 10 });
    await productRepository.create(product);

    const result = await useCase.execute({
      id: product.getId(),
      name: 'New Name',
      category: 'New Cat',
      description: 'Updated desc',
      price: 200,
      stock: 5,
    });

    expect(result.id).toBe(product.getId());
    expect(result.name).toBe('New Name');
    expect(result.category).toBe('New Cat');
    expect(result.description).toBe('Updated desc');
    expect(result.price).toBe(200);
    expect(result.stock).toBe(5);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw ProductNotFoundException if product does not exist', async () => {
    await expect(useCase.execute({ id: 'non-existent' } as any)).rejects.toThrow(
      ProductNotFoundException,
    );
  });

  it('should throw ProductAlreadyExistsException if updating to a name/category that already exists', async () => {
    const p1 = makeProduct({ name: 'Name1', category: 'Cat1' });
    const p2 = makeProduct({ name: 'Name2', category: 'Cat2' });
    await productRepository.create(p1);
    await productRepository.create(p2);

    await expect(
      useCase.execute({ id: p2.getId(), name: 'Name1', category: 'Cat1' }),
    ).rejects.toThrow(ProductAlreadyExistsException);
  });

  it('should throw ValidationException if price <= 0', async () => {
    const product = makeProduct({ price: 100 });
    await productRepository.create(product);

    await expect(useCase.execute({ id: product.getId(), price: 0 })).rejects.toThrow(
      ValidationException,
    );
  });

  it('should throw ValidationException if stock < 0', async () => {
    const product = makeProduct({ stock: 10 });
    await productRepository.create(product);

    await expect(useCase.execute({ id: product.getId(), stock: -1 })).rejects.toThrow(
      ValidationException,
    );
  });
});
