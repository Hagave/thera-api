import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';
import { WinstonLoggerService } from '@shared/logger/winston-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const { method, url } = request;
    const traceId = (request as any).traceId || 'N/A';

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(`[${traceId}] ${method} ${url} - ${responseTime}ms`, 'HTTP');
      }),
    );
  }
}
