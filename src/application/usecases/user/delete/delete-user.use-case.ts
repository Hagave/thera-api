import { Inject, Injectable } from '@nestjs/common';
import { IDeleteUserInput, IDeleteUserOutput } from './delete-user.use-case.dto';
import { IUserRepository, USER_REPOSITORY } from '@domain/user/repositories/user.repository';
import { UserNotFoundException } from '@domain/user/exceptions/user-not-found.exception';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: IDeleteUserInput): Promise<IDeleteUserOutput> {
    const user = await this.userRepository.findById(input.id);

    if (!user || user.isDeleted()) {
      throw new UserNotFoundException(`User with ID ${input.id} not found`);
    }

    user.delete();
    await this.userRepository.update(user);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
