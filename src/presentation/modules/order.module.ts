import { forwardRef, Module } from '@nestjs/common';
import { ProductModule } from './product.module';
import { OrderController } from '@presentation/controllers/order/order.controller';
import { CreateOrderUseCase } from '@application/usecases/order/create/create-order.use-case';
import { GetOrderUseCase } from '@application/usecases/order/get/get-order.use-case';
import { ListOrdersUseCase } from '@application/usecases/order/list/list-orders.use-case';
import { CompleteOrderUseCase } from '@application/usecases/order/complete/complete-order.use-case';
import { OrderMapper } from '@infrastructure/mappers/order.mapper';
import { ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import { PrismaOrderRepository } from '@infrastructure/repositories/prisma-order.repository';
import { RedisIdempotencyRepository } from '@infrastructure/cache/repositories/redis-idempotency.repository';
import { RedisPendingOrderRepository } from '@infrastructure/cache/repositories/redis-pending-order.repository';
import { CancelOrderUseCase } from '@application/usecases/order/cancel/cancel-order.use-case';

@Module({
  imports: [forwardRef(() => ProductModule)],
  controllers: [OrderController],
  providers: [
    CreateOrderUseCase,
    GetOrderUseCase,
    ListOrdersUseCase,
    CompleteOrderUseCase,
    CancelOrderUseCase,
    OrderMapper,
    RedisIdempotencyRepository,
    RedisPendingOrderRepository,
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY, CancelOrderUseCase],
})
export class OrderModule {}
