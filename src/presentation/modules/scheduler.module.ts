import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderModule } from './order.module';
import { RedisPendingOrderRepository } from '@infrastructure/cache/repositories/redis-pending-order.repository';
import { OrderExpirationScheduler } from '@infrastructure/scheduler/order-expiration.scheduler';

@Module({
  imports: [ScheduleModule.forRoot(), OrderModule],
  providers: [OrderExpirationScheduler, RedisPendingOrderRepository],
})
export class SchedulerModule {}
