import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '@domain/product/repositories/product.repository';
import { Inject, Injectable } from '@nestjs/common';
import { IGetProductInput, IGetProductOutput } from './get-product.use-case.dto';
import { ProductNotFoundException } from '@domain/product/exceptions/product-not-found.exception';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(input: IGetProductInput): Promise<IGetProductOutput> {
    const product = await this.productRepository.findById(input.id);

    if (!product || product.isDeleted()) {
      throw new ProductNotFoundException(input.id);
    }

    return {
      id: product.getId(),
      name: product.getName(),
      category: product.getCategory(),
      description: product.getDescription(),
      price: product.getPrice().getAmount(),
      stock: product.getStock(),
      createdAt: product.getCreatedAt(),
      updatedAt: product.getUpdatedAt(),
    };
  }
}
