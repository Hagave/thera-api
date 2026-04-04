import { v4 as uuidv4 } from 'uuid';
import { Order } from '@domain/order/entities/order.entity';
import { OrderStatus } from '@domain/order/value-objects/order-status.vo';
import { OrderItem } from '@domain/order/entities/order-item.entity';
import { Money } from '@shared/value-objects/money.vo';

type MakeOrderInput = {
  id?: string;
  userId?: string;
  status?: OrderStatus;
  items?: OrderItem[];
  createdAt?: Date;
  updatedAt?: Date;
};

export function makeOrder(input: MakeOrderInput = {}): Order {
  const orderId = input.id ?? uuidv4();

  const items = input.items ?? [
    new OrderItem({
      id: uuidv4(),
      orderId,
      productId: uuidv4(),
      quantity: 2,
      price: new Money(300),
    }),
  ];

  const total = items.reduce((acc, item) => acc.add(item.getSubtotal()), new Money(0));

  return new Order({
    id: orderId,
    userId: input.userId ?? uuidv4(),
    status: input.status ?? OrderStatus.pending(),
    items,
    total,
    createdAt: input.createdAt ?? new Date(),
    updatedAt: input.updatedAt ?? new Date(),
  });
}
