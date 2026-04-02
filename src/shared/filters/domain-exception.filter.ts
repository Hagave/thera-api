import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BusinessRuleException } from '@shared/exceptions/business-rule.exception';
import { DomainException } from '@shared/exceptions/domain.exception';
import { NotFoundException } from '@shared/exceptions/not-found.exception';
import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { WinstonLoggerService } from '@shared/logger/winston-logger.service';
import { FastifyReply } from 'fastify';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {}

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest();

    const status = this.getHttpStatus(exception);
    const message = exception.message;

    this.logger.error(
      `${request.method} ${request.url} - ${message}`,
      exception.stack,
      'DomainExceptionFilter',
    );

    response.status(status).send({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getHttpStatus(exception: DomainException): number {
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
}
