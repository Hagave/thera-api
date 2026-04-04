import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '@domain/product/repositories/product.repository';
import { Inject, Injectable } from '@nestjs/common';
import { IDeleteProductInput, IDeleteProductOutput } from './delete-product.use-case.dto';
import { ProductNotFoundException } from '@domain/product/exceptions/product-not-found.exception';
import { IOrderRepository, ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import { ProductHasOrdersException } from '@domain/product/exceptions/product-has-orders.exception';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(input: IDeleteProductInput): Promise<IDeleteProductOutput> {
    const product = await this.productRepository.findById(input.id);

    if (!product || product.isDeleted()) {
      throw new ProductNotFoundException(input.id);
    }

    // Verificar se produto tem pedidos
    const hasOrders = await this.orderRepository.hasOrdersByProductId(input.id);

    if (hasOrders) {
      throw new ProductHasOrdersException(input.id);
    }

    product.delete();

    await this.productRepository.update(product);

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}
