import { CreateProductUseCase } from '@application/usecases/product/create/create-product.use-case';
import { DeleteProductUseCase } from '@application/usecases/product/delete/delete-product.use-case';
import { GetProductUseCase } from '@application/usecases/product/get/get-product.use-case';
import { ListProductsUseCase } from '@application/usecases/product/list/list-products.use-case';
import { UpdateProductUseCase } from '@application/usecases/product/update/update-product.use-case';
import { Body, Controller, Post, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  CreateProductRequestDto,
  CreateProductResponseDto,
} from '@presentation/dtos/product/create-product.dto';
import { DeleteProductResponseDto } from '@presentation/dtos/product/delete-product.dto';
import { GetProductResponseDto } from '@presentation/dtos/product/get-product.dto';
import {
  ListProductsQueryDto,
  ListProductsResponseDto,
} from '@presentation/dtos/product/list-products.dto';
import {
  UpdateProductRequestDto,
  UpdateProductResponseDto,
} from '@presentation/dtos/product/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: CreateProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input (price or stock)' })
  @ApiResponse({ status: 422, description: 'Product already exists in this category' })
  async create(@Body() dto: CreateProductRequestDto): Promise<CreateProductResponseDto> {
    return await this.createProductUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List products with advanced filters' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: ListProductsResponseDto,
  })
  async list(@Query() query: ListProductsQueryDto): Promise<ListProductsResponseDto> {
    return await this.listProductsUseCase.execute({
      page: query.page || 1,
      limit: query.limit || 10,
      name: query.name,
      category: query.category,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      minStock: query.minStock,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: GetProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getById(@Param('id') id: string): Promise<GetProductResponseDto> {
    return await this.getProductUseCase.execute({ id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: UpdateProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Invalid input (price or stock)' })
  @ApiResponse({ status: 422, description: 'Product name already exists in this category' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductRequestDto,
  ): Promise<UpdateProductResponseDto> {
    return await this.updateProductUseCase.execute({ id, ...dto });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    type: DeleteProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async delete(@Param('id') id: string): Promise<DeleteProductResponseDto> {
    return await this.deleteProductUseCase.execute({ id });
  }
}
