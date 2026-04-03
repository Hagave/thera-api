import { Order } from '@domain/order/entities/order.entity';
import { IOrderRepository } from '@domain/order/repositories/order.repository';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { OrderMapper } from '@infrastructure/mappers/order.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: OrderMapper,
  ) {}

  async create(order: Order): Promise<Order> {
    const data = this.mapper.toPrismaCreate(order);
    const created = await this.prisma.order.create({
      data,
      include: { items: true },
    });
    return this.mapper.toDomain(created);
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return order ? this.mapper.toDomain(order) : null;
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ orders: Order[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: { items: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({
        where: { userId },
      }),
    ]);

    return {
      orders: orders.map((o) => this.mapper.toDomain(o)),
      total,
    };
  }

  async findAll(page: number, limit: number): Promise<{ orders: Order[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        include: { items: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count(),
    ]);

    return {
      orders: orders.map((o) => this.mapper.toDomain(o)),
      total,
    };
  }

  async update(order: Order): Promise<Order> {
    const data = this.mapper.toPrismaUpdate(order);
    const updated = await this.prisma.order.update({
      where: { id: order.getId() },
      data,
      include: { items: true },
    });
    return this.mapper.toDomain(updated);
  }
  async completeOrderWithStockUpdate(
    orderId: string,
    stockUpdates: Map<string, number>,
  ): Promise<Order> {
    return await this.prisma.$transaction(async (tx) => {
      // Atualizar estoque de cada produto
      for (const [productId, quantity] of stockUpdates.entries()) {
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });
      }

      // Atualizar status do pedido
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
        include: { items: true },
      });

      return this.mapper.toDomain(updated);
    });
  }
}
