import { CreateUserUseCase } from '@application/usecases/user/create/create-user.use-case';
import { forwardRef, Module } from '@nestjs/common';
import { UserController } from '@presentation/controllers/user/user.controller';
import { GetUserUseCase } from '@application/usecases/user/get/get-user.use-case';
import { ListUsersUseCase } from '@application/usecases/user/list/list-users.use-case';
import { UpdateUserUseCase } from '@application/usecases/user/update/update-user.use-case';
import { DeleteUserUseCase } from '@application/usecases/user/delete/delete-user.use-case';
import { UserMapper } from '@infrastructure/mappers/user.mapper';
import { USER_REPOSITORY } from '@domain/user/repositories/user.repository';
import { PrismaUserRepository } from '@infrastructure/repositories/prisma-user.repository';
import { RedisIdempotencyRepository } from '@infrastructure/cache/repositories/redis-idempotency.repository';
import { AuthModule } from './auth.module';
@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UserMapper,
    RedisIdempotencyRepository,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
