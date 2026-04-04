import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CreateOrderUseCase } from '@application/usecases/order/create/create-order.use-case';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/in-memory.order.repository';
import { InMemoryProductRepository } from '@infrastructure/repositories/in-memory/in-memory.product.repository';

import { ProductNotFoundException } from '@domain/product/exceptions/product-not-found.exception';
import { DuplicateRequestException } from '@shared/exceptions/duplicate-request.exception';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { makeProduct } from 'test/product/factory/make-product.factory';

describe('CreateOrderUseCase', () => {
  let orderRepository: InMemoryOrderRepository;
  let productRepository: InMemoryProductRepository;

  let idempotencyRepository: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };

  let pendingOrderRepository: {
    addPendingOrder: ReturnType<typeof vi.fn>;
  };

  let useCase: CreateOrderUseCase;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository();

    idempotencyRepository = {
      get: vi.fn(),
      set: vi.fn(),
    };

    pendingOrderRepository = {
      addPendingOrder: vi.fn(),
    };

    useCase = new CreateOrderUseCase(
      orderRepository,
      productRepository,
      idempotencyRepository as any,
      pendingOrderRepository as any,
    );
  });

  it('should create order successfully', async () => {
    const product = makeProduct({ price: 100, stock: 10 });

    await productRepository.create(product);

    const result = await useCase.execute({
      userId: 'user-1',
      items: [
        {
          productId: product.getId(),
          quantity: 2,
        },
      ],
    });

    expect(result.id).toBeDefined();
    expect(result.total).toBe(200);
    expect(result.status).toBe('PENDING');
    expect(result.items[0].productId).toBe(product.getId());

    expect(pendingOrderRepository.addPendingOrder).toHaveBeenCalledWith(result.id, 'user-1');
  });

  it('should aggregate stock reservations', async () => {
    const product = makeProduct({ price: 50, stock: 10 });

    await productRepository.create(product);

    const result = await useCase.execute({
      userId: 'user-1',
      items: [
        { productId: product.getId(), quantity: 2 },
        { productId: product.getId(), quantity: 3 },
      ],
    });

    expect(orderRepository.lastStockReservation?.get(product.getId())).toBe(5);
    expect(result.total).toBe(250);
  });

  it('should throw if no items provided', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        items: [],
      }),
    ).rejects.toBeInstanceOf(ValidationException);
  });

  it('should throw if product not found', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        items: [{ productId: 'invalid', quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(ProductNotFoundException);
  });

  it('should throw if product is deleted', async () => {
    const product = makeProduct({ stock: 10 });

    product.delete();

    await productRepository.create(product);

    await expect(
      useCase.execute({
        userId: 'user-1',
        items: [{ productId: product.getId(), quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(ProductNotFoundException);
  });

  it('should respect idempotency key', async () => {
    idempotencyRepository.get.mockResolvedValue({
      orderId: 'existing-order-id',
    });

    await expect(
      useCase.execute({
        userId: 'user-1',
        items: [{ productId: 'any', quantity: 1 }],
        idempotencyKey: 'key-1',
      }),
    ).rejects.toBeInstanceOf(DuplicateRequestException);
  });

  it('should store idempotency key after creation', async () => {
    idempotencyRepository.get.mockResolvedValue(null);

    const product = makeProduct({ stock: 10 });

    await productRepository.create(product);

    const result = await useCase.execute({
      userId: 'user-1',
      items: [{ productId: product.getId(), quantity: 1 }],
      idempotencyKey: 'key-1',
    });

    expect(idempotencyRepository.set).toHaveBeenCalledWith('key-1', result.id);
  });

  it('should call repository with correct stock reservation', async () => {
    const product = makeProduct({ stock: 10 });

    await productRepository.create(product);

    const spy = vi.spyOn(orderRepository, 'createOrderWithStockReservation');

    await useCase.execute({
      userId: 'user-1',
      items: [{ productId: product.getId(), quantity: 4 }],
    });

    expect(spy).toHaveBeenCalled();

    const [, stockMap] = spy.mock.calls[0];

    expect(stockMap.get(product.getId())).toBe(4);
  });
});
