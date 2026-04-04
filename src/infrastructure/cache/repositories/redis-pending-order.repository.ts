import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisPendingOrderRepository {
  private readonly PREFIX = 'pending_order';
  private readonly TTL = 1800; // 1800 = 30 minutos em segundos

  constructor(private readonly redis: RedisService) {}

  async addPendingOrder(orderId: string, userId: string): Promise<void> {
    const key = `${this.PREFIX}:${orderId}`;
    await this.redis.set(key, { orderId, userId, createdAt: new Date().toISOString() }, this.TTL);
  }

  async removePendingOrder(orderId: string): Promise<void> {
    const key = `${this.PREFIX}:${orderId}`;
    await this.redis.del(key);
  }

  async getAllPendingOrders(): Promise<string[]> {
    const pattern = `${this.PREFIX}:*`;
    return await this.redis.keys(pattern);
  }

  async isPending(orderId: string): Promise<boolean> {
    const key = `${this.PREFIX}:${orderId}`;
    const data = await this.redis.get(key);
    return data !== null;
  }
}
