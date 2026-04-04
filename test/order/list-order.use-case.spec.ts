import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ListOrdersUseCase } from '@application/usecases/order/list/list-orders.use-case';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/in-memory.order.repository';
import { makeOrder } from './factory/make-order.factory';

describe('ListOrdersUseCase', () => {
  let orderRepository: InMemoryOrderRepository;
  let useCase: ListOrdersUseCase;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    useCase = new ListOrdersUseCase(orderRepository);
  });

  it('should list all orders when no userId provided', async () => {
    const order1 = makeOrder({ userId: 'user-1' });
    const order2 = makeOrder({ userId: 'user-2' });

    await orderRepository.create(order1);
    await orderRepository.create(order2);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
    });

    expect(result.orders).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('should list only orders from specific user', async () => {
    const order1 = makeOrder({ userId: 'user-1' });
    const order2 = makeOrder({ userId: 'user-2' });

    await orderRepository.create(order1);
    await orderRepository.create(order2);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      userId: 'user-1',
    });

    expect(result.orders).toHaveLength(1);
    expect(result.orders[0].userId).toBe('user-1');
  });

  it('should call findByUserId when userId is provided', async () => {
    const spy = vi.spyOn(orderRepository, 'findByUserId');

    const order = makeOrder({ userId: 'user-1' });
    await orderRepository.create(order);

    await useCase.execute({
      page: 1,
      limit: 10,
      userId: 'user-1',
    });

    expect(spy).toHaveBeenCalledWith('user-1', 1, 10);
  });

  it('should call findAll when userId is not provided', async () => {
    const spy = vi.spyOn(orderRepository, 'findAll');

    const order = makeOrder();
    await orderRepository.create(order);

    await useCase.execute({
      page: 1,
      limit: 10,
    });

    expect(spy).toHaveBeenCalledWith(1, 10);
  });

  it('should calculate totalPages correctly', async () => {
    for (let i = 0; i < 15; i++) {
      await orderRepository.create(makeOrder());
    }

    const result = await useCase.execute({
      page: 1,
      limit: 10,
    });

    expect(result.total).toBe(15);
    expect(result.totalPages).toBe(2);
  });

  it('should map order fields correctly', async () => {
    const order = makeOrder();

    await orderRepository.create(order);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
    });

    const output = result.orders[0];

    expect(output.id).toBe(order.getId());
    expect(output.userId).toBe(order.getUserId());
    expect(output.total).toBe(order.getTotal().getAmount());
    expect(output.status).toBe(order.getStatus().getValue());
    expect(output.createdAt).toEqual(order.getCreatedAt());
    expect(output.totalItems).toBe(order.getItems().length);
  });

  it('should return empty list when no orders exist', async () => {
    const result = await useCase.execute({
      page: 1,
      limit: 10,
    });

    expect(result.orders).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
  });
});
