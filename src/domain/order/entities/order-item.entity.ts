import { Money } from '@shared/value-objects/money.vo';

export class OrderItem {
  private id: string;
  private orderId: string;
  private productId: string;
  private quantity: number;
  private price: Money;

  constructor(props: {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: Money;
  }) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.price = props.price;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getOrderId(): string {
    return this.orderId;
  }

  getProductId(): string {
    return this.productId;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getPrice(): Money {
    return this.price;
  }

  getSubtotal(): Money {
    return this.price.multiply(this.quantity);
  }
}
