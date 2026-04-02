import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ILogger } from './logger.interface';

@Injectable()
export class WinstonLoggerService implements ILogger, LoggerService {
  private logger: winston.Logger;

  constructor(private readonly config: ConfigService) {
    const logLevel = this.config.get<string>('LOG_LEVEL', 'info');
    const logPath = this.config.get<string>('LOG_FILE_PATH', './logs');

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, trace }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
            }),
          ),
        }),
        new DailyRotateFile({
          dirname: logPath,
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new DailyRotateFile({
          dirname: logPath,
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }
}
