import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthController } from '@presentation/controllers/health/health.controller';
import { PrismaModule } from '@presentation/modules/prisma.module';
import { RedisModule } from '@presentation/modules/redis.module';
import { UserModule } from '@presentation/modules/user.module';
import { HttpExceptionFilter } from '@shared/filters/http-exception.filter';
import { LoggingInterceptor } from '@shared/interceptors/logging.interceptor';
import { TraceIdInterceptor } from '@shared/interceptors/trace-id.interceptor';
import { WinstonLoggerService } from '@shared/logger/winston-logger.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    UserModule,
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
      useClass: LoggingInterceptor,
    },
  ],
  controllers: [HealthController],
  exports: [WinstonLoggerService],
})
export class AppModule {}
