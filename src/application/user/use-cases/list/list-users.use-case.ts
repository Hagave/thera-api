import { Inject, Injectable } from '@nestjs/common';
import { IListUsersInput, IListUsersOutput } from './list-users.use-case.dto';
import { IUserRepository } from '@domain/user/repositories/user.repository';
import { USER_REPOSITORY } from '@domain/user/repositories/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: IListUsersInput): Promise<IListUsersOutput> {
    const { page, limit } = input;

    const { users, total } = await this.userRepository.list(page, limit);

    return {
      users: users.map((user) => ({
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        createdAt: user.getCreatedAt(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
