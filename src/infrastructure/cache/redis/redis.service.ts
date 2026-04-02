import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { ICacheService } from '../cache.interface';
import { getRedisConfig } from './redis.config';
import { WinstonLoggerService } from '@shared/logger/winston-logger.service';

@Injectable()
export class RedisService implements ICacheService, OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    const redisConfig = getRedisConfig(this.config);
    this.client = createClient(redisConfig) as RedisClientType;

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err?.stack || err.message, 'RedisService');
    });
  }
  async onModuleInit() {
    await this.client.connect();
    this.logger.log('Redis connected', 'RedisService');
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }
}
