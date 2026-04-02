import { RedisService } from '@infrastructure/cache/redis/redis.service';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
  imports: [ConfigModule],
})
export class RedisModule {}
