import { Inject, Injectable } from '@nestjs/common';

import { IListProductsInput, IListProductsOutput } from './list-products.use-case.dto';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '@domain/product/repositories/product.repository';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(input: IListProductsInput): Promise<IListProductsOutput> {
    const { page, limit, ...filters } = input;

    const { products, total } = await this.productRepository.list(page, limit, filters);

    return {
      products: products.map((product) => ({
        id: product.getId(),
        name: product.getName(),
        category: product.getCategory(),
        description: product.getDescription(),
        price: product.getPrice().getAmount(),
        stock: product.getStock(),
        createdAt: product.getCreatedAt(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
