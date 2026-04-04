import { Inject, Injectable } from '@nestjs/common';
import { ICancelOrderInput, ICancelOrderOutput } from './cancel-order.use-case.dto';
import { IOrderRepository, ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import { ValidationException } from '@shared/exceptions/validation.exception';

@Injectable()
export class CancelOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(input: ICancelOrderInput): Promise<ICancelOrderOutput> {
    const order = await this.orderRepository.findById(input.id);

    if (!order) {
      throw new ValidationException(`Order with ID ${input.id} not found`);
    }

    if (!order.getStatus().isPending()) {
      throw new ValidationException('Only pending orders can be cancelled');
    }

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
