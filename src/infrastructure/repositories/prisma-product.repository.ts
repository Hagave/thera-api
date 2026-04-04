import { Product } from '@domain/product/entities/product.entity';
import {
  IProductFilters,
  IProductRepository,
} from '@domain/product/repositories/product.repository';
import { Prisma } from '@infrastructure/database/prisma/generated/prisma/client';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { ProductMapper } from '@infrastructure/mappers/product.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: ProductMapper,
  ) {}

  async create(product: Product): Promise<Product> {
    const data = this.mapper.toPrismaCreate(product);
    const created = await this.prisma.product.create({ data });
    return this.mapper.toDomain(created);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    return product ? this.mapper.toDomain(product) : null;
  }

  async findByNameAndCategory(name: string, category: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        name_category: {
          name,
          category,
        },
      },
    });
    return product ? this.mapper.toDomain(product) : null;
  }

  async update(product: Product): Promise<Product> {
    const data = this.mapper.toPrismaUpdate(product);
    const updated = await this.prisma.product.update({
      where: { id: product.getId() },
      data,
    });
    return this.mapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async list(
    page: number,
    limit: number,
    filters?: IProductFilters,
  ): Promise<{ products: Product[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters?.category) {
      where.category = {
        equals: filters.category,
        mode: 'insensitive',
      };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.minStock !== undefined) {
      where.stock = {
        gte: filters.minStock,
      };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';
    orderBy[sortBy] = sortOrder;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => this.mapper.toDomain(p)),
      total,
    };
  }
}
