import { Inject, Injectable } from '@nestjs/common';
import { ICompleteOrderInput, ICompleteOrderOutput } from './complete-order.use-case.dto';
import { IOrderRepository, ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '@domain/product/repositories/product.repository';
import { InsufficientStockException } from '@domain/product/exceptions/insufficient-stock.exception';
import { RedisPendingOrderRepository } from '@infrastructure/cache/repositories/redis-pending-order.repository';
import { ValidationException } from '@shared/exceptions/validation.exception';

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
    const order = await this.orderRepository.findById(input.id);

    if (!order) {
      throw new ValidationException(`Order with ID ${input.id} not found`);
    }

    if (!order.getStatus().isPending()) {
      throw new ValidationException('Only pending orders can be completed');
    }

    const productIds = [...new Set(order.getItems().map((item) => item.getProductId()))];
    const products = await this.productRepository.findByIds(productIds);

    if (products.length !== productIds.length) {
      throw new ValidationException('One or more products not found');
    }
    const productMap = new Map(products.map((p) => [p.getId(), p]));

    const stockUpdates = new Map<string, number>();

    for (const item of order.getItems()) {
      const product = productMap.get(item.getProductId());

      if (!product || product.isDeleted()) {
        throw new ValidationException(`Product ${item.getProductId()} not found`);
      }

      // validação leve antes de agregar
      if (!product.hasStock(item.getQuantity())) {
        throw new InsufficientStockException(
          product.getName(),
          product.getStock(),
          item.getQuantity(),
        );
      }

      const current = stockUpdates.get(product.getId()) ?? 0;
      stockUpdates.set(product.getId(), current + item.getQuantity());
    }
    for (const [productId, totalQty] of stockUpdates) {
      const product = productMap.get(productId)!;

      if (!product.hasStock(totalQty)) {
        throw new InsufficientStockException(product.getName(), product.getStock(), totalQty);
      }
    }

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
