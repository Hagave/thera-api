import { Inject, Injectable } from '@nestjs/common';
import { IGetUserInput, IGetUserOutput } from './get-user.use-case.dto';
import { IUserRepository, USER_REPOSITORY } from '@domain/user/repositories/user.repository';
import { UserNotFoundException } from '@domain/user/exceptions/user-not-found.exception';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: IGetUserInput): Promise<IGetUserOutput> {
    const user = await this.userRepository.findById(input.id);

    if (!user || user.isDeleted()) {
      throw new UserNotFoundException(input.id);
    }

    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }
}
