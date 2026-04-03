export enum OrderStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class OrderStatus {
  private readonly value: OrderStatusEnum;

  constructor(status: OrderStatusEnum) {
    this.value = status;
  }

  static pending(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PENDING);
  }

  static completed(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.COMPLETED);
  }

  static cancelled(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.CANCELLED);
  }

  getValue(): OrderStatusEnum {
    return this.value;
  }

  isPending(): boolean {
    return this.value === OrderStatusEnum.PENDING;
  }

  isCompleted(): boolean {
    return this.value === OrderStatusEnum.COMPLETED;
  }

  isCancelled(): boolean {
    return this.value === OrderStatusEnum.CANCELLED;
  }

  canTransitionTo(newStatus: OrderStatus): boolean {
    const currentStatus = this.value;
    const targetStatus = newStatus.getValue();

    // PENDING -> COMPLETED ou CANCELLED
    if (currentStatus === OrderStatusEnum.PENDING) {
      return (
        targetStatus === OrderStatusEnum.COMPLETED || targetStatus === OrderStatusEnum.CANCELLED
      );
    }

    // COMPLETED ou CANCELLED não podem mudar
    return false;
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }
}
