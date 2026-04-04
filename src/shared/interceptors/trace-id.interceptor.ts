import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const traceId = (request.headers['x-trace-id'] as string) || uuidv4();

    (request as any).traceId = traceId;

    response.header('x-trace-id', traceId);

    return next.handle();
  }
}
