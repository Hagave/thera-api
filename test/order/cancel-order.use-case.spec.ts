import { describe, it, expect, beforeEach } from 'vitest';
import { CancelOrderUseCase } from '@application/usecases/order/cancel/cancel-order.use-case';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/in-memory.order.repository';
import { makeOrder } from './factory/make-order.factory';

describe('CancelOrderUseCase', () => {
  let orderRepository: InMemoryOrderRepository;
  let useCase: CancelOrderUseCase;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    useCase = new CancelOrderUseCase(orderRepository);
  });

  it('should cancel order successfully', async () => {
    const order = makeOrder();

    await orderRepository.create(order);

    const result = await useCase.execute({
      id: order.getId(),
    });

    expect(result.id).toBe(order.getId());
    expect(result.status).toBe('CANCELLED');

    const updated = await orderRepository.findById(order.getId());
    expect(updated?.getStatus().getValue()).toBe('CANCELLED');
  });

  it('should return stock correctly', async () => {
    const order = makeOrder();

    await orderRepository.create(order);

    await useCase.execute({
      id: order.getId(),
    });

    const items = order.getItems();

    const expectedStock = new Map<string, number>();
    for (const item of items) {
      expectedStock.set(item.getProductId(), item.getQuantity());
    }

    expect(orderRepository.lastStockReturn).toEqual(expectedStock);
  });

  it('should throw if order does not exist', async () => {
    await expect(
      useCase.execute({
        id: 'invalid-id',
      }),
    ).rejects.toBeInstanceOf(ValidationException);
  });

  it('should throw if order is not pending', async () => {
    const order = makeOrder();

    // muda status para completed
    order.complete();

    await orderRepository.create(order);

    await expect(
      useCase.execute({
        id: order.getId(),
      }),
    ).rejects.toBeInstanceOf(ValidationException);
  });

  it('should not call cancel if already invalid state', async () => {
    const order = makeOrder();

    order.complete();

    await orderRepository.create(order);

    try {
      await useCase.execute({
        id: order.getId(),
      });
    } catch {}

    const updated = await orderRepository.findById(order.getId());

    // garante que estado não mudou
    expect(updated?.getStatus().getValue()).toBe('COMPLETED');
  });
});
