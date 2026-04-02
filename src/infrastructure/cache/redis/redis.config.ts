import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (config: ConfigService) => ({
  socket: {
    host: config.get<string>('REDIS_HOST', 'localhost'),
    port: config.get<number>('REDIS_PORT', 6379),
  },
  password: config.get<string>('REDIS_PASSWORD'),
});
