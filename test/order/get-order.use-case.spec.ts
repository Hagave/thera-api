import { describe, it, expect, beforeEach } from 'vitest';
import { GetOrderUseCase } from '@application/usecases/order/get/get-order.use-case';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/in-memory.order.repository';
import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';
import { makeOrder } from './factory/make-order.factory';
import { NotFoundException } from '@shared/exceptions/not-found.exception';

describe('GetOrderUseCase', () => {
  let orderRepository: InMemoryOrderRepository;
  let useCase: GetOrderUseCase;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    useCase = new GetOrderUseCase(orderRepository);
  });

  it('should return order successfully', async () => {
    const order = makeOrder();

    await orderRepository.create(order);

    const result = await useCase.execute({
      id: order.getId(),
    });

    expect(result.id).toBe(order.getId());
    expect(result.userId).toBe(order.getUserId());
    expect(result.total).toBe(order.getTotal().getAmount());
    expect(result.status).toBe(order.getStatus().getValue());

    expect(result.items.length).toBe(order.getItems().length);
  });

  it('should map items correctly', async () => {
    const order = makeOrder();

    await orderRepository.create(order);

    const result = await useCase.execute({
      id: order.getId(),
    });

    const item = result.items[0];
    const original = order.getItems()[0];

    expect(item.productId).toBe(original.getProductId());
    expect(item.quantity).toBe(original.getQuantity());
    expect(item.price).toBe(original.getPrice().getAmount());
    expect(item.subtotal).toBe(original.getSubtotal().getAmount());
  });

  it('should throw if order does not exist', async () => {
    await expect(
      useCase.execute({
        id: 'invalid-id',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should allow access when user is owner', async () => {
    const order = makeOrder({ userId: 'user-1' });

    await orderRepository.create(order);

    const result = await useCase.execute({
      id: order.getId(),
      userId: 'user-1',
    });

    expect(result.id).toBe(order.getId());
  });

  it('should throw if user is not owner', async () => {
    const order = makeOrder({ userId: 'user-1' });

    await orderRepository.create(order);

    await expect(
      useCase.execute({
        id: order.getId(),
        userId: 'user-2',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should allow access when userId is not provided (admin/system)', async () => {
    const order = makeOrder({ userId: 'user-1' });

    await orderRepository.create(order);

    const result = await useCase.execute({
      id: order.getId(),
    });

    expect(result.id).toBe(order.getId());
  });
});
