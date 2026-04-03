import { EmptyOrderException } from '@domain/order/exceptions/empty-order.exception';
import { IOrderRepository, ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '@domain/product/repositories/product.repository';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ICreateOrderInput, ICreateOrderOutput } from './create-order.use-case.dto';
import { ProductNotFoundException } from '@domain/product/exceptions/product-not-found.exception';
import { InsufficientStockException } from '@domain/product/exceptions/insufficient-stock.exception';
import { OrderItem } from '@domain/order/entities/order-item.entity';
import { Money } from '@shared/value-objects/money.vo';
import { Order } from '@domain/order/entities/order.entity';
import { OrderStatus } from '@domain/order/value-objects/order-status.vo';
import { RedisIdempotencyRepository } from '@infrastructure/cache/repositories/redis-idempotency.repository';
import { DuplicateRequestException } from '@shared/exceptions/duplicate-request.exception';
import { RedisPendingOrderRepository } from '@infrastructure/cache/repositories/redis-pending-order.repository';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly idempotencyRepository: RedisIdempotencyRepository,
    private readonly pendingOrderRepository: RedisPendingOrderRepository,
  ) {}

  async execute(input: ICreateOrderInput): Promise<ICreateOrderOutput> {
    // Verificar idempotência
    if (input.idempotencyKey) {
      const existing = await this.idempotencyRepository.get(input.idempotencyKey);
      if (existing) {
        throw new DuplicateRequestException(existing.orderId);
      }
    }

    // Validar pedido não vazio
    if (!input.items || input.items.length === 0) {
      throw new EmptyOrderException();
    }

    // Buscar todos os produtos
    const productPromises = input.items.map((item) =>
      this.productRepository.findById(item.productId),
    );
    const products = await Promise.all(productPromises);

    // Validar que todos os produtos existem
    const productMap = new Map();
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const requestedItem = input.items[i];

      if (!product || product.isDeleted()) {
        throw new ProductNotFoundException(requestedItem.productId);
      }

      productMap.set(product.getId(), product);
    }

    // Criar OrderItems
    const orderId = uuidv4();
    const orderItems = input.items.map((item) => {
      const product = productMap.get(item.productId);
      return new OrderItem({
        id: uuidv4(),
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: product.getPrice(),
      });
    });

    // Criar Order
    const order = new Order({
      id: orderId,
      userId: input.userId,
      items: orderItems,
      total: new Money(0),
      status: OrderStatus.pending(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const total = order.calculateTotal();
    const finalOrder = new Order({
      id: order.getId(),
      userId: order.getUserId(),
      items: order.getItems(),
      total,
      status: order.getStatus(),
      createdAt: order.getCreatedAt(),
      updatedAt: order.getUpdatedAt(),
    });

    // Preparar reservas de estoque
    const stockReservations = new Map<string, number>();
    for (const item of finalOrder.getItems()) {
      stockReservations.set(item.getProductId(), item.getQuantity());
    }

    // Criar pedido COM reserva de estoque (transação atômica)
    const created = await this.orderRepository.createOrderWithStockReservation(
      finalOrder,
      stockReservations,
    );

    // Adicionar ao Redis como PENDING (expira em 30min)
    await this.pendingOrderRepository.addPendingOrder(created.getId(), input.userId);

    // Salvar idempotency key
    if (input.idempotencyKey) {
      await this.idempotencyRepository.set(input.idempotencyKey, created.getId());
    }

    return {
      id: created.getId(),
      userId: created.getUserId(),
      items: created.getItems().map((item) => {
        const product = productMap.get(item.getProductId());
        return {
          productId: item.getProductId(),
          productName: product.getName(),
          quantity: item.getQuantity(),
          price: item.getPrice().getAmount(),
          subtotal: item.getSubtotal().getAmount(),
        };
      }),
      total: created.getTotal().getAmount(),
      status: created.getStatus().getValue(),
      createdAt: created.getCreatedAt(),
    };
  }
}
