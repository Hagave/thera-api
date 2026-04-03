import { Product } from '@domain/product/entities/product.entity';
import { Product as PrismaProduct } from '@infrastructure/database/prisma/generated/prisma/client';
import { Injectable } from '@nestjs/common';
import { Money } from '@shared/value-objects/money.vo';

@Injectable()
export class ProductMapper {
  toDomain(prismaProduct: PrismaProduct): Product {
    return new Product({
      id: prismaProduct.id,
      name: prismaProduct.name,
      category: prismaProduct.category,
      description: prismaProduct.description,
      price: new Money(Number(prismaProduct.price)),
      stock: prismaProduct.stock,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
      deletedAt: prismaProduct.deletedAt || undefined,
    });
  }

  toPrismaCreate(product: Product) {
    return {
      id: product.getId(),
      name: product.getName(),
      category: product.getCategory(),
      description: product.getDescription(),
      price: product.getPrice().getAmount(),
      stock: product.getStock(),
    };
  }

  toPrismaUpdate(product: Product) {
    return {
      name: product.getName(),
      category: product.getCategory(),
      description: product.getDescription(),
      price: product.getPrice().getAmount(),
      stock: product.getStock(),
      deletedAt: product.getDeletedAt(),
    };
  }
}
