import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  create(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ orders: Order[]; total: number }>;
  findAll(page: number, limit: number): Promise<{ orders: Order[]; total: number }>;
  update(order: Order): Promise<Order>;
  completeOrderWithStockUpdate(orderId: string, stockUpdates: Map<string, number>): Promise<Order>; // NOVO
  completeOrderWithStockUpdate(orderId: string, stockUpdates: Map<string, number>): Promise<Order>;
  cancelOrderWithStockReturn(orderId: string, stockReturns: Map<string, number>): Promise<Order>; // NOVO
  createOrderWithStockReservation(
    order: Order,
    stockReservations: Map<string, number>,
  ): Promise<Order>;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
