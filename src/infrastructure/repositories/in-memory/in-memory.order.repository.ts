import { IOrderRepository } from '@domain/order/repositories/order.repository';
import { Order } from '@domain/order/entities/order.entity';

export class InMemoryOrderRepository implements IOrderRepository {
  private orders = new Map<string, Order>();

  public lastStockReturn?: Map<string, number>;
  public lastStockUpdate?: Map<string, number>;
  public lastStockReservation?: Map<string, number>;

  async create(order: Order): Promise<Order> {
    this.orders.set(order.getId(), order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async update(order: Order): Promise<Order> {
    this.orders.set(order.getId(), order);
    return order;
  }

  async cancelOrderWithStockReturn(
    orderId: string,
    stockReturns: Map<string, number>,
  ): Promise<Order> {
    const order = this.orders.get(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.cancel();

    this.orders.set(orderId, order);

    this.lastStockReturn = stockReturns;

    return order;
  }

  async findAll(page: number, limit: number): Promise<{ orders: Order[]; total: number }> {
    const allOrders = Array.from(this.orders.values());
    const total = allOrders.length;
    const start = (page - 1) * limit;
    const paginated = allOrders.slice(start, start + limit);

    return { orders: paginated, total };
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ orders: Order[]; total: number }> {
    const filtered = Array.from(this.orders.values()).filter(
      (order) => order.getUserId() === userId,
    );
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return { orders: paginated, total };
  }

  async completeOrderWithStockUpdate(
    orderId: string,
    stockUpdates: Map<string, number>,
  ): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // aplica regra de domínio
    order.complete();

    // guarda para assert no teste
    this.lastStockUpdate = stockUpdates;

    return order;
  }

  async createOrderWithStockReservation(
    order: Order,
    stockReservations: Map<string, number>,
  ): Promise<Order> {
    this.orders.set(order.getId(), order);

    this.lastStockReservation = stockReservations;

    return order;
  }

  async hasOrdersByProductId(): Promise<boolean> {
    return false;
  }
}
