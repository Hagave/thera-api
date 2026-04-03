import { Inject, Injectable } from '@nestjs/common';
import { IGetOrderInput, IGetOrderOutput } from './get-order.use-case.dto';
import { IOrderRepository, ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import { OrderNotFoundException } from '@domain/order/exceptions/order-not-found.exception';
import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(input: IGetOrderInput): Promise<IGetOrderOutput> {
    const order = await this.orderRepository.findById(input.id);

    if (!order) {
      throw new OrderNotFoundException(input.id);
    }

    // Se userId foi fornecido, validar que o pedido pertence ao usuário
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
