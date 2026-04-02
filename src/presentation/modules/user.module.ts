import { CreateUserUseCase } from '@application/user/use-cases/create/create-user.use-case';
import { Module } from '@nestjs/common';
import { UserController } from '@presentation/controllers/user/user.controller';
import { GetUserUseCase } from '@application/user/use-cases/get/get-user.use-case';
import { ListUsersUseCase } from '@application/user/use-cases/list/list-users.use-case';
import { UpdateUserUseCase } from '@application/user/use-cases/update/update-user.use-case';
import { DeleteUserUseCase } from '@application/user/use-cases/delete/delete-user.use-case';
import { UserMapper } from '@infrastructure/mappers/user.mapper';
import { USER_REPOSITORY } from '@domain/user/repositories/user.repository';
import { PrismaUserRepository } from '@infrastructure/repositories/prisma-user.repository';
@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UserMapper,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
