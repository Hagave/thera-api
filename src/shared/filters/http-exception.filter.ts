import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BusinessRuleException } from '@shared/exceptions/business-rule.exception';
import { DomainException } from '@shared/exceptions/domain.exception';
import { DuplicateRequestException } from '@shared/exceptions/duplicate-request.exception';
import { NotFoundException } from '@shared/exceptions/not-found.exception';
import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { WinstonLoggerService } from '@shared/logger/winston-logger.service';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const traceId = (request as any).traceId || '';
    const status = this.getHttpStatus(exception);
    const message = this.getErrorMessage(exception);
    const errorName = this.getErrorName(exception);

    // Log apenas erros 5xx
    if (status >= 500) {
      this.logger.error(
        `[${traceId}] ${request.method} ${request.url} - ${message}`,
        (exception as Error).stack,
        'HttpExceptionFilter',
      );
    }

    if (exception instanceof DuplicateRequestException) {
      reply.header('X-Resource-Id', exception.existingResourceId);
    }

    reply.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      traceId,
      error: {
        message,
        error: errorName,
        statusCode: status,
      },
    });
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof DuplicateRequestException) {
      return HttpStatus.CONFLICT;
    }

    if (exception instanceof NotFoundException) {
      return HttpStatus.NOT_FOUND;
    }

    if (exception instanceof ValidationException) {
      return HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof UnauthorizedException) {
      return HttpStatus.UNAUTHORIZED;
    }

    if (exception instanceof BusinessRuleException) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (typeof response === 'object' && response !== null && 'message' in response) {
        const message = (response as { message: string | string[] }).message;
        return Array.isArray(message) ? message.join(', ') : message;
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private getErrorName(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.constructor.name;
    }

    if (exception instanceof DomainException) {
      return exception.constructor.name;
    }

    return 'InternalServerError';
  }
}
