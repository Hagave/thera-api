import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthController } from '@presentation/controllers/health/health.controller';
import { AuthModule } from '@presentation/modules/auth.module';
import { OrderModule } from '@presentation/modules/order.module';
import { PrismaModule } from '@presentation/modules/prisma.module';
import { ProductModule } from '@presentation/modules/product.module';
import { RedisModule } from '@presentation/modules/redis.module';
import { UserModule } from '@presentation/modules/user.module';
import { HttpExceptionFilter } from '@shared/filters/http-exception.filter';
import { TraceIdInterceptor } from '@shared/interceptors/trace-id.interceptor';
import { TransformResponseInterceptor } from '@shared/interceptors/transform-response.interceptor';
import { WinstonLoggerService } from '@shared/logger/winston-logger.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SchedulerModule } from '@presentation/modules/scheduler.module';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos
        limit: 100, // 100 requests
      },
    ]),
    AuthModule,
    PrismaModule,
    RedisModule,
    UserModule,
    ProductModule,
    OrderModule,
    SchedulerModule,
  ],
  providers: [
    WinstonLoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [HealthController],
  exports: [WinstonLoggerService],
})
export class AppModule {}
