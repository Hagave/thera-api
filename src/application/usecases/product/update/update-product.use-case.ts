import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '@domain/product/repositories/product.repository';
import { Inject, Injectable } from '@nestjs/common';
import { IUpdateProductInput, IUpdateProductOutput } from './update-product.use-case.dto';
import { ProductNotFoundException } from '@domain/product/exceptions/product-not-found.exception';
import { ProductAlreadyExistsException } from '@domain/product/exceptions/product-already-exists.exception';
import { Money } from '@shared/value-objects/money.vo';
import { ValidationException } from '@shared/exceptions/validation.exception';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(input: IUpdateProductInput): Promise<IUpdateProductOutput> {
    const product = await this.productRepository.findById(input.id);

    if (!product || product.isDeleted()) {
      throw new ProductNotFoundException(input.id);
    }

    if (input.name) {
      product.setName(input.name);
    }

    if (input.category) {
      product.setCategory(input.category);
    }

    if (input.name || input.category) {
      const existing = await this.productRepository.findByNameAndCategory(
        product.getName(),
        product.getCategory(),
      );

      if (existing && existing.getId() !== product.getId()) {
        throw new ProductAlreadyExistsException(product.getName(), product.getCategory());
      }
    }

    if (input.description) {
      product.setDescription(input.description);
    }

    if (input.price !== undefined) {
      if (input.price <= 0) {
        throw new ValidationException('Price must be greater than zero');
      }
      product.setPrice(new Money(input.price));
    }

    if (input.stock !== undefined) {
      if (input.stock < 0) {
        throw new ValidationException('Stock cannot be negative');
      }
      product.setStock(input.stock);
    }

    const updated = await this.productRepository.update(product);

    return {
      id: updated.getId(),
      name: updated.getName(),
      category: updated.getCategory(),
      description: updated.getDescription(),
      price: updated.getPrice().getAmount(),
      stock: updated.getStock(),
      updatedAt: updated.getUpdatedAt(),
    };
  }
}
