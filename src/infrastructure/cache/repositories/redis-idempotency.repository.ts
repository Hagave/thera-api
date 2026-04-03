import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface IdempotencyRecord {
  orderId: string;
  createdAt: string;
}

@Injectable()
export class RedisIdempotencyRepository {
  private readonly PREFIX = 'idempotency';
  private readonly TTL = 86400; // 24 horas

  constructor(private readonly redis: RedisService) {}

  async get(key: string): Promise<IdempotencyRecord | null> {
    const data = await this.redis.get<IdempotencyRecord>(`${this.PREFIX}:${key}`);
    return data;
  }

  async set(key: string, orderId: string): Promise<void> {
    const record: IdempotencyRecord = {
      orderId,
      createdAt: new Date().toISOString(),
    };
    await this.redis.set(`${this.PREFIX}:${key}`, record, this.TTL);
  }
}
