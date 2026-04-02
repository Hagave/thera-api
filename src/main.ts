import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { WinstonLoggerService } from '@shared/logger/winston-logger.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });

  const logger = app.get(WinstonLoggerService);
  app.useLogger(logger);

  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
