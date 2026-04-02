import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';

export interface StandardResponse<T> {
  statusCode: number;
  timestamp: string;
  path: string;
  traceId: string;
  data?: T;
  error?: {
    message: string;
    error: string;
    statusCode: number;
  };
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        traceId: (request as any).traceId || '',
        data,
      })),
    );
  }
}
