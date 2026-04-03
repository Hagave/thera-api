import { Inject, Injectable } from '@nestjs/common';
import { ICompleteOrderInput, ICompleteOrderOutput } from './complete-order.use-case.dto';
import { IOrderRepository, ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '@domain/product/repositories/product.repository';
import { OrderNotFoundException } from '@domain/order/exceptions/order-not-found.exception';
import { InvalidOrderStatusException } from '@domain/order/exceptions/invalid-order-status.exception';
import { InsufficientStockException } from '@domain/product/exceptions/insufficient-stock.exception';
import { RedisPendingOrderRepository } from '@infrastructure/cache/repositories/redis-pending-order.repository';

@Injectable()
export class CompleteOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly pendingOrderRepository: RedisPendingOrderRepository,
  ) {}

  async execute(input: ICompleteOrderInput): Promise<ICompleteOrderOutput> {
    // Buscar pedido
    const order = await this.orderRepository.findById(input.id);

    if (!order) {
      throw new OrderNotFoundException(input.id);
    }

    if (!order.getStatus().isPending()) {
      throw new InvalidOrderStatusException('Only pending orders can be completed');
    }

    // Validar estoque disponível para todos os itens
    const stockUpdates = new Map<string, number>();

    for (const item of order.getItems()) {
      const product = await this.productRepository.findById(item.getProductId());

      if (!product || product.isDeleted()) {
        throw new OrderNotFoundException(`Product ${item.getProductId()} not found`);
      }

      if (!product.hasStock(item.getQuantity())) {
        throw new InsufficientStockException(
          product.getName(),
          product.getStock(),
          item.getQuantity(),
        );
      }

      stockUpdates.set(product.getId(), item.getQuantity());
    }

    // Completar pedido com atualização de estoque (transação no repository)
    const updated = await this.orderRepository.completeOrderWithStockUpdate(
      order.getId(),
      stockUpdates,
    );
    await this.pendingOrderRepository.removePendingOrder(updated.getId());

    return {
      id: updated.getId(),
      status: updated.getStatus().getValue(),
      updatedAt: updated.getUpdatedAt(),
    };
  }
}
