import { CompleteOrderUseCase } from '@application/usecases/order/complete/complete-order.use-case';
import { CreateOrderUseCase } from '@application/usecases/order/create/create-order.use-case';
import { GetOrderUseCase } from '@application/usecases/order/get/get-order.use-case';
import { ListOrdersUseCase } from '@application/usecases/order/list/list-orders.use-case';
import { Body, Controller, Post, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CompleteOrderResponseDto } from '@presentation/dtos/order/complete-order.dto';
import {
  CreateOrderRequestDto,
  CreateOrderResponseDto,
} from '@presentation/dtos/order/create-order.dto';
import { GetOrderResponseDto } from '@presentation/dtos/order/get-order.dto';
import {
  ListOrdersQueryDto,
  ListOrdersResponseDto,
} from '@presentation/dtos/order/list-orders.dto';
import { JwtAuthGuard } from '@presentation/guards/jwt-auth.guard';
import { CurrentUser, ICurrentUser } from '@shared/decorators/current-user.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly completeOrderUseCase: CompleteOrderUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: CreateOrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or empty order' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 422, description: 'Insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() dto: CreateOrderRequestDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<CreateOrderResponseDto> {
    return await this.createOrderUseCase.execute({
      userId: user.id,
      items: dto.items,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List user orders' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: ListOrdersResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(
    @Query() query: ListOrdersQueryDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<ListOrdersResponseDto> {
    return await this.listOrdersUseCase.execute({
      page: query.page || 1,
      limit: query.limit || 10,
      userId: user.id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: GetOrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: ICurrentUser,
  ): Promise<GetOrderResponseDto> {
    return await this.getOrderUseCase.execute({ id, userId: user.id });
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete order and update stock' })
  @ApiParam({ name: 'id', description: 'Order ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Order completed successfully',
    type: CompleteOrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 422, description: 'Invalid status or insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async complete(@Param('id') id: string): Promise<CompleteOrderResponseDto> {
    return await this.completeOrderUseCase.execute({ id });
  }
}
