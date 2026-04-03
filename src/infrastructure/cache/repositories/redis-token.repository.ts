import { IRefreshTokenRepository } from '@domain/auth/repositories/refresh-token.repository';
import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisTokenRepository implements IRefreshTokenRepository {
  private readonly PREFIX = 'refresh_token';

  constructor(private readonly redis: RedisService) {}

  async save(userId: string, token: string, expiresIn: number): Promise<void> {
    const key = this.getKey(token);
    await this.redis.set(key, userId, expiresIn);
  }

  async findByToken(token: string): Promise<string | null> {
    const key = this.getKey(token);
    return await this.redis.get<string>(key);
  }

  async delete(token: string): Promise<void> {
    const key = this.getKey(token);
    await this.redis.del(key);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    const pattern = `${this.PREFIX}:*`;
    const keys = await this.redis.keys(pattern);

    for (const key of keys) {
      const value = await this.redis.get<string>(key);
      if (value === userId) {
        await this.redis.del(key);
      }
    }
  }

  private getKey(token: string): string {
    return `${this.PREFIX}:${token}`;
  }
}
