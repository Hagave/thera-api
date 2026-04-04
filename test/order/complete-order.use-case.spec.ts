import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CompleteOrderUseCase } from '@application/usecases/order/complete/complete-order.use-case';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { InsufficientStockException } from '@domain/product/exceptions/insufficient-stock.exception';

import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/in-memory.order.repository';
import { InMemoryProductRepository } from '@infrastructure/repositories/in-memory/in-memory.product.repository';
import { makeProduct } from 'test/product/factory/make-product.factory';
import { makeOrder } from './factory/make-order.factory';

describe('CompleteOrderUseCase', () => {
  let orderRepository: InMemoryOrderRepository;
  let productRepository: InMemoryProductRepository;
  let pendingOrderRepository: { removePendingOrder: ReturnType<typeof vi.fn> };

  let useCase: CompleteOrderUseCase;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository();

    pendingOrderRepository = {
      removePendingOrder: vi.fn(),
    };

    useCase = new CompleteOrderUseCase(
      orderRepository,
      productRepository,
      pendingOrderRepository as any,
    );
  });

  it('should complete order successfully', async () => {
    const product = makeProduct({ stock: 10 });

    await productRepository.create(product);

    const order = makeOrder({
      items: [
        {
          getProductId: () => product.getId(),
          getQuantity: () => 2,
          getSubtotal: () => product.getPrice().multiply(2),
        } as any,
      ],
    });

    await orderRepository.create(order);

    const result = await useCase.execute({
      id: order.getId(),
    });

    expect(result.status).toBe('COMPLETED');

    const updated = await orderRepository.findById(order.getId());
    expect(updated?.getStatus().getValue()).toBe('COMPLETED');

    expect(pendingOrderRepository.removePendingOrder).toHaveBeenCalledWith(order.getId());
  });

  it('should aggregate quantities for same product', async () => {
    const product = makeProduct({ stock: 5 });

    await productRepository.create(product);

    const order = makeOrder({
      items: [
        {
          getProductId: () => product.getId(),
          getQuantity: () => 2,
          getSubtotal: () => product.getPrice().multiply(2),
        },
        {
          getProductId: () => product.getId(),
          getQuantity: () => 3,
          getSubtotal: () => product.getPrice().multiply(3),
        },
      ] as any,
    });

    await orderRepository.create(order);

    await useCase.execute({ id: order.getId() });

    expect(orderRepository.lastStockUpdate?.get(product.getId())).toBe(5);
  });

  it('should throw if order does not exist', async () => {
    await expect(useCase.execute({ id: 'invalid-id' })).rejects.toBeInstanceOf(ValidationException);
  });

  it('should throw if order is not pending', async () => {
    const order = makeOrder();

    order.complete();

    await orderRepository.create(order);

    await expect(useCase.execute({ id: order.getId() })).rejects.toBeInstanceOf(
      ValidationException,
    );
  });

  it('should throw if product not found', async () => {
    const order = makeOrder();

    await orderRepository.create(order);

    await expect(useCase.execute({ id: order.getId() })).rejects.toBeInstanceOf(
      ValidationException,
    );
  });

  it('should throw if product is deleted', async () => {
    const product = makeProduct({ stock: 10 });

    product.delete();

    await productRepository.create(product);

    const order = makeOrder({
      items: [
        {
          getProductId: () => product.getId(),
          getQuantity: () => 1,
          getSubtotal: () => product.getPrice(),
        },
      ] as any,
    });

    await orderRepository.create(order);

    await expect(useCase.execute({ id: order.getId() })).rejects.toBeInstanceOf(
      ValidationException,
    );
  });

  it('should throw if insufficient stock (per item)', async () => {
    const product = makeProduct({ stock: 1 });

    await productRepository.create(product);

    const order = makeOrder({
      items: [
        {
          getProductId: () => product.getId(),
          getQuantity: () => 2,
          getSubtotal: () => product.getPrice().multiply(2),
        },
      ] as any,
    });

    await orderRepository.create(order);

    await expect(useCase.execute({ id: order.getId() })).rejects.toBeInstanceOf(
      InsufficientStockException,
    );
  });

  it('should throw if insufficient stock (aggregated)', async () => {
    const product = makeProduct({ stock: 4 });

    await productRepository.create(product);

    const order = makeOrder({
      items: [
        {
          getProductId: () => product.getId(),
          getQuantity: () => 2,
          getSubtotal: () => product.getPrice().multiply(2),
        },
        {
          getProductId: () => product.getId(),
          getQuantity: () => 3,
          getSubtotal: () => product.getPrice().multiply(3),
        },
      ] as any,
    });

    await orderRepository.create(order);

    await expect(useCase.execute({ id: order.getId() })).rejects.toBeInstanceOf(
      InsufficientStockException,
    );
  });

  it('should not call repository update if validation fails', async () => {
    const product = makeProduct({ stock: 1 });

    await productRepository.create(product);

    const order = makeOrder({
      items: [
        {
          getProductId: () => product.getId(),
          getQuantity: () => 2,
          getSubtotal: () => product.getPrice().multiply(2),
        },
      ] as any,
    });

    await orderRepository.create(order);

    const spy = vi.spyOn(orderRepository, 'completeOrderWithStockUpdate');

    await expect(useCase.execute({ id: order.getId() })).rejects.toBeInstanceOf(
      InsufficientStockException,
    );

    expect(spy).not.toHaveBeenCalled();
  });
});
