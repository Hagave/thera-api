import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  imports: [ConfigModule],
})
export class PrismaModule {}
