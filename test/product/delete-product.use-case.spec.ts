import { describe, it, expect, beforeEach } from 'vitest';
import { ProductNotFoundException } from '@domain/product/exceptions/product-not-found.exception';
import { ProductHasOrdersException } from '@domain/product/exceptions/product-has-orders.exception';
import { Product } from '@domain/product/entities/product.entity';
import { Money } from '@shared/value-objects/money.vo';
import { v4 as uuidv4 } from 'uuid';
import { InMemoryProductRepository } from '@infrastructure/repositories/in-memory/in-memory.product.repository';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/in-memory.order.repository';
import { DeleteProductUseCase } from '@application/usecases/product/delete/delete-product.use-case';

let productRepository: InMemoryProductRepository;
let orderRepository: InMemoryOrderRepository;
let useCase: DeleteProductUseCase;

beforeEach(() => {
  productRepository = new InMemoryProductRepository();
  orderRepository = new InMemoryOrderRepository();
  useCase = new DeleteProductUseCase(productRepository, orderRepository);
});

describe('DeleteProductUseCase', () => {
  it('should delete a product successfully', async () => {
    const product = new Product({
      id: uuidv4(),
      name: 'Produto A',
      category: 'Cat A',
      description: 'Desc',
      price: new Money(100),
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await productRepository.create(product);

    const result = await useCase.execute({ id: product.getId() });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Product deleted successfully');

    const deletedProduct = await productRepository.findById(product.getId());
    expect(deletedProduct).toBeNull(); // soft delete marcado
  });

  it('should throw if product does not exist', async () => {
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toBeInstanceOf(
      ProductNotFoundException,
    );
  });

  it('should throw if product has orders', async () => {
    const product = new Product({
      id: uuidv4(),
      name: 'Produto B',
      category: 'Cat B',
      description: '',
      price: new Money(50),
      stock: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await productRepository.create(product);

    orderRepository.addOrderForProduct(product.getId()); // marca que há pedido

    await expect(useCase.execute({ id: product.getId() })).rejects.toBeInstanceOf(
      ProductHasOrdersException,
    );
  });
});
