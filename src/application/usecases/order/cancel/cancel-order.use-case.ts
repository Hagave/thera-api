import { Inject, Injectable } from '@nestjs/common';
import { ICancelOrderInput, ICancelOrderOutput } from './cancel-order.use-case.dto';
import { IOrderRepository, ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import { OrderNotFoundException } from '@domain/order/exceptions/order-not-found.exception';
import { InvalidOrderStatusException } from '@domain/order/exceptions/invalid-order-status.exception';

@Injectable()
export class CancelOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(input: ICancelOrderInput): Promise<ICancelOrderOutput> {
    const order = await this.orderRepository.findById(input.id);

    if (!order) {
      throw new OrderNotFoundException(input.id);
    }

    if (!order.getStatus().isPending()) {
      throw new InvalidOrderStatusException('Only pending orders can be cancelled');
    }

    // Cancelar pedido com devolução de estoque (transação no repository)
    const stockReturns = new Map<string, number>();
    for (const item of order.getItems()) {
      stockReturns.set(item.getProductId(), item.getQuantity());
    }

    const updated = await this.orderRepository.cancelOrderWithStockReturn(
      order.getId(),
      stockReturns,
    );

    return {
      id: updated.getId(),
      status: updated.getStatus().getValue(),
      updatedAt: updated.getUpdatedAt(),
    };
  }
}
