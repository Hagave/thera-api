import { Inject, Injectable } from '@nestjs/common';
import { IGetOrderInput, IGetOrderOutput } from './get-order.use-case.dto';
import { IOrderRepository, ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';
import { NotFoundException } from '@shared/exceptions/not-found.exception';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(input: IGetOrderInput): Promise<IGetOrderOutput> {
    const order = await this.orderRepository.findById(input.id);

    if (!order) {
      throw new NotFoundException('Order', input.id);
    }

    if (input.userId && order.getUserId() !== input.userId) {
      throw new UnauthorizedException('You do not have permission to view this order');
    }

    return {
      id: order.getId(),
      userId: order.getUserId(),
      items: order.getItems().map((item) => ({
        productId: item.getProductId(),
        quantity: item.getQuantity(),
        price: item.getPrice().getAmount(),
        subtotal: item.getSubtotal().getAmount(),
      })),
      total: order.getTotal().getAmount(),
      status: order.getStatus().getValue(),
      createdAt: order.getCreatedAt(),
      updatedAt: order.getUpdatedAt(),
    };
  }
}
