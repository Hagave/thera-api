import { CreateProductUseCase } from '@application/usecases/product/create/create-product.use-case';
import { DeleteProductUseCase } from '@application/usecases/product/delete/delete-product.use-case';
import { GetProductUseCase } from '@application/usecases/product/get/get-product.use-case';
import { ListProductsUseCase } from '@application/usecases/product/list/list-products.use-case';
import { UpdateProductUseCase } from '@application/usecases/product/update/update-product.use-case';
import { PRODUCT_REPOSITORY } from '@domain/product/repositories/product.repository';
import { ProductMapper } from '@infrastructure/mappers/product.mapper';
import { PrismaProductRepository } from '@infrastructure/repositories/prisma-product.repository';
import { Module } from '@nestjs/common';
import { ProductController } from '@presentation/controllers/product/product.controller';

@Module({
  controllers: [ProductController],
  providers: [
    CreateProductUseCase,
    GetProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    ProductMapper,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductModule {}
