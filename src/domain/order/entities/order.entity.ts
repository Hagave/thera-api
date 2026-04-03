import { Money } from '@shared/value-objects/money.vo';
import { OrderStatus } from '../value-objects/order-status.vo';
import { OrderItem } from './order-item.entity';

export class Order {
  private id: string;
  private userId: string;
  private items: OrderItem[];
  private total: Money;
  private status: OrderStatus;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    items: OrderItem[];
    total: Money;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.items = props.items;
    this.total = props.total;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getItems(): OrderItem[] {
    return this.items;
  }

  getTotal(): Money {
    return this.total;
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  calculateTotal(): Money {
    return this.items.reduce((acc, item) => acc.add(item.getSubtotal()), new Money(0));
  }

  complete(): void {
    const newStatus = OrderStatus.completed();
    if (!this.status.canTransitionTo(newStatus)) {
      throw new Error('Cannot complete order with current status');
    }
    this.status = newStatus;
    this.touch();
  }

  cancel(): void {
    const newStatus = OrderStatus.cancelled();
    if (!this.status.canTransitionTo(newStatus)) {
      throw new Error('Cannot cancel order with current status');
    }
    this.status = newStatus;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
