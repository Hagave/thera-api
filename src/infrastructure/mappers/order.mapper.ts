import { Order } from '@domain/order/entities/order.entity';
import { OrderStatus, OrderStatusEnum } from '@domain/order/value-objects/order-status.vo';
import { Injectable } from '@nestjs/common';
import { Money } from '@shared/value-objects/money.vo';
import {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
} from '@infrastructure/database/prisma/generated/prisma/client';
import { OrderItem } from '@domain/order/entities/order-item.entity';

@Injectable()
export class OrderMapper {
  toDomain(prismaOrder: PrismaOrder & { items: PrismaOrderItem[] }): Order {
    const items = prismaOrder.items.map(
      (item) =>
        new OrderItem({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: new Money(Number(item.price)),
        }),
    );

    return new Order({
      id: prismaOrder.id,
      userId: prismaOrder.userId,
      items,
      total: new Money(Number(prismaOrder.total)),
      status: new OrderStatus(prismaOrder.status as OrderStatusEnum),
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
    });
  }

  toPrismaCreate(order: Order) {
    return {
      id: order.getId(),
      userId: order.getUserId(),
      total: order.getTotal().getAmount(),
      status: order.getStatus().getValue(),
      items: {
        create: order.getItems().map((item) => ({
          id: item.getId(),
          productId: item.getProductId(),
          quantity: item.getQuantity(),
          price: item.getPrice().getAmount(),
        })),
      },
    };
  }

  toPrismaUpdate(order: Order) {
    return {
      total: order.getTotal().getAmount(),
      status: order.getStatus().getValue(),
      updatedAt: order.getUpdatedAt(),
    };
  }
}
