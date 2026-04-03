import { EmptyOrderException } from '@domain/order/exceptions/empty-order.exception';
import { IOrderRepository, ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '@domain/product/repositories/product.repository';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ICreateOrderInput, ICreateOrderOutput } from './create-order.use-case.dto';
import { ProductNotFoundException } from '@domain/product/exceptions/product-not-found.exception';
import { InsufficientStockException } from '@domain/product/exceptions/insufficient-stock.exception';
import { OrderItem } from '@domain/order/entities/order-item.entity';
import { Money } from '@shared/value-objects/money.vo';
import { Order } from '@domain/order/entities/order.entity';
import { OrderStatus } from '@domain/order/value-objects/order-status.vo';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: ICreateOrderInput): Promise<ICreateOrderOutput> {
    // Validar pedido não vazio
    if (!input.items || input.items.length === 0) {
      throw new EmptyOrderException();
    }

    // Buscar todos os produtos em paralelo
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

      // Validar estoque disponível
      if (!product.hasStock(requestedItem.quantity)) {
        throw new InsufficientStockException(
          product.getName(),
          product.getStock(),
          requestedItem.quantity,
        );
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

    // Calcular total
    const total = order.calculateTotal();

    // Recriar order com total calculado
    const finalOrder = new Order({
      id: order.getId(),
      userId: order.getUserId(),
      items: order.getItems(),
      total,
      status: order.getStatus(),
      createdAt: order.getCreatedAt(),
      updatedAt: order.getUpdatedAt(),
    });

    // Persistir
    const created = await this.orderRepository.create(finalOrder);

    // Retornar output
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
