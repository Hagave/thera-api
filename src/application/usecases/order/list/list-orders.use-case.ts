import { IOrderRepository, ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import { Inject, Injectable } from '@nestjs/common';
import { IListOrdersInput, IListOrdersOutput } from './list-orders.use-case.dto';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(input: IListOrdersInput): Promise<IListOrdersOutput> {
    const { page, limit, userId } = input;

    const { orders, total } = userId
      ? await this.orderRepository.findByUserId(userId, page, limit)
      : await this.orderRepository.findAll(page, limit);

    return {
      orders: orders.map((order) => ({
        id: order.getId(),
        userId: order.getUserId(),
        totalItems: order.getItems().length,
        total: order.getTotal().getAmount(),
        status: order.getStatus().getValue(),
        createdAt: order.getCreatedAt(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
