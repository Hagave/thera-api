import { CreateUserUseCase } from '@application/user/use-cases/create/create-user.use-case';
import { USER_REPOSITORY } from '@domain/user/repositories/user.repository';
import { UserMapper } from '@infrastructure/mappers/user.mapper';
import { PrismaUserRepository } from '@infrastructure/repositories/prisma-user.repository';
import { Module } from '@nestjs/common';
import { UserController } from '@presentation/controllers/user/user.controller';

@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    UserMapper,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
