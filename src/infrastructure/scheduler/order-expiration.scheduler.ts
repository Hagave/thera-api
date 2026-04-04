import { IOrderRepository, ORDER_REPOSITORY } from '@domain/order/repositories/order.repository';
import { RedisPendingOrderRepository } from '@infrastructure/cache/repositories/redis-pending-order.repository';
import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WinstonLoggerService } from '@shared/logger/winston-logger.service';

@Injectable()
export class OrderExpirationScheduler {
  constructor(
    private readonly pendingOrderRepository: RedisPendingOrderRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredOrders(): Promise<void> {
    this.logger.log('Checking for expired pending orders...', 'OrderExpirationScheduler');

    try {
      const pendingOrderIds = await this.pendingOrderRepository.getAllPendingOrders();

      this.logger.log(
        `Found ${pendingOrderIds.length} pending orders in Redis`,
        'OrderExpirationScheduler',
      );

      const { orders: allOrders } = await this.orderRepository.findAll(1, 1000);
      const pendingInDb = allOrders.filter((order) => order.getStatus().isPending());

      this.logger.log(
        `Found ${pendingInDb.length} PENDING orders in database`,
        'OrderExpirationScheduler',
      );

      let expiredCount = 0;

      // Comparar: se está PENDING no banco MAS NÃO está no Redis = expirou
      for (const order of pendingInDb) {
        const isInRedis = pendingOrderIds.includes(order.getId());

        if (!isInRedis) {
          this.logger.log(
            `Order ${order.getId()} expired (not in Redis), cancelling...`,
            'OrderExpirationScheduler',
          );

          try {
            const stockReturns = new Map<string, number>();
            for (const item of order.getItems()) {
              stockReturns.set(item.getProductId(), item.getQuantity());
            }

            await this.orderRepository.cancelOrderWithStockReturn(order.getId(), stockReturns);

            expiredCount++;
            this.logger.log(
              `Order ${order.getId()} cancelled successfully`,
              'OrderExpirationScheduler',
            );
          } catch (error) {
            this.logger.error(
              `Failed to cancel order ${order.getId()}`,
              (error as Error).stack,
              'OrderExpirationScheduler',
            );
          }
        }
      }

      if (expiredCount > 0) {
        this.logger.log(`Cancelled ${expiredCount} expired orders`, 'OrderExpirationScheduler');
      } else {
        this.logger.log('No expired orders found', 'OrderExpirationScheduler');
      }
    } catch (error) {
      this.logger.error(
        'Error checking expired orders',
        (error as Error).stack,
        'OrderExpirationScheduler',
      );
    }
  }
}
