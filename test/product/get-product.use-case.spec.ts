import { Product } from '@domain/product/entities/product.entity';
import { Money } from '@shared/value-objects/money.vo';
import { ProductNotFoundException } from '@domain/product/exceptions/product-not-found.exception';
import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryProductRepository } from '@infrastructure/repositories/in-memory/in-memory.product.repository';
import { GetProductUseCase } from '@application/usecases/product/get/get-product.use-case';

describe('GetProductUseCase', () => {
  let productRepository: InMemoryProductRepository;
  let useCase: GetProductUseCase;

  beforeEach(() => {
    productRepository = new InMemoryProductRepository();
    useCase = new GetProductUseCase(productRepository);
  });

  it('should return product when it exists', async () => {
    const product = new Product({
      id: uuidv4(),
      name: 'Product A',
      category: 'Category 1',
      description: 'Test product',
      price: new Money(100),
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await productRepository.create(product);

    const result = await useCase.execute({ id: product.getId() });

    expect(result.id).toBe(product.getId());
    expect(result.name).toBe(product.getName());
    expect(result.category).toBe(product.getCategory());
    expect(result.description).toBe(product.getDescription());
    expect(result.price).toBe(product.getPrice().getAmount());
    expect(result.stock).toBe(product.getStock());
    expect(result.createdAt).toEqual(product.getCreatedAt());
    expect(result.updatedAt).toEqual(product.getUpdatedAt());
  });

  it('should throw ProductNotFoundException if product does not exist', async () => {
    const fakeId = uuidv4();

    await expect(useCase.execute({ id: fakeId })).rejects.toThrow(ProductNotFoundException);
  });

  it('should throw ProductNotFoundException if product is deleted', async () => {
    const product = new Product({
      id: uuidv4(),
      name: 'Product B',
      category: 'Category 2',
      description: 'Deleted product',
      price: new Money(50),
      stock: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await productRepository.create(product);
    product.delete();
    await productRepository.update(product);

    await expect(useCase.execute({ id: product.getId() })).rejects.toThrow(
      ProductNotFoundException,
    );
  });
});
