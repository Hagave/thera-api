import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '@domain/product/repositories/product.repository';
import { Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ICreateProductInput, ICreateProductOutput } from './create-product.use-case.dto';
import { ProductAlreadyExistsException } from '@domain/product/exceptions/product-already-exists.exception';
import { Product } from '@domain/product/entities/product.entity';
import { Money } from '@shared/value-objects/money.vo';
import { ValidationException } from '@shared/exceptions/validation.exception';

export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(input: ICreateProductInput): Promise<ICreateProductOutput> {
    if (input.price <= 0) {
      throw new ValidationException('Price must be greater than zero');
    }

    if (input.stock < 0) {
      throw new ValidationException('Stock cannot be negative');
    }

    const existing = await this.productRepository.findByNameAndCategory(input.name, input.category);

    if (existing) {
      throw new ProductAlreadyExistsException(input.name, input.category);
    }

    const product = new Product({
      id: uuidv4(),
      name: input.name,
      category: input.category,
      description: input.description,
      price: new Money(input.price),
      stock: input.stock,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.productRepository.create(product);

    return {
      id: created.getId(),
      name: created.getName(),
      category: created.getCategory(),
      description: created.getDescription(),
      price: created.getPrice().getAmount(),
      stock: created.getStock(),
      createdAt: created.getCreatedAt(),
    };
  }
}
