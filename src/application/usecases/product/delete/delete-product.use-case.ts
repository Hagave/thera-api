import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '@domain/product/repositories/product.repository';
import { Inject, Injectable } from '@nestjs/common';
import { IDeleteProductInput, IDeleteProductOutput } from './delete-product.use-case.dto';
import { ProductNotFoundException } from '@domain/product/exceptions/product-not-found.exception';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(input: IDeleteProductInput): Promise<IDeleteProductOutput> {
    const product = await this.productRepository.findById(input.id);

    if (!product || product.isDeleted()) {
      throw new ProductNotFoundException(input.id);
    }

    // TODO: Verificar se produto tem pedidos pendentes
    // Isso será implementado quando tivermos o módulo Order

    await this.productRepository.delete(input.id);

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}
