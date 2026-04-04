import { DeleteUserUseCase } from '@application/usecases/user/delete/delete-user.use-case';
import { InMemoryUserRepository } from '@infrastructure/repositories/in-memory/in-memory.user.repository';
import { describe, it, expect, beforeEach } from 'vitest';
import { makeUser } from './factory/make-user.factory';
import { UserNotFoundException } from '@domain/user/exceptions/user-not-found.exception';

describe('DeleteUserUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let useCase: DeleteUserUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    useCase = new DeleteUserUseCase(userRepository);
  });

  it('should delete a user successfully (soft delete)', async () => {
    const user = makeUser();

    await userRepository.create(user);

    const result = await useCase.execute({
      id: user.getId(),
    });

    expect(result).toEqual({
      success: true,
      message: 'User deleted successfully',
    });

    const found = await userRepository.findById(user.getId());

    expect(found).not.toBeNull();
    expect(found?.isDeleted()).toBe(true);
  });

  it('should throw if user does not exist', async () => {
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });

  it('should throw if user is already deleted', async () => {
    const user = makeUser();

    user.delete();

    await userRepository.create(user);

    await expect(useCase.execute({ id: user.getId() })).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });

  it('should not affect other users when deleting one', async () => {
    const user1 = makeUser();
    const user2 = makeUser();

    await userRepository.create(user1);
    await userRepository.create(user2);

    await useCase.execute({ id: user1.getId() });

    const foundUser1 = await userRepository.findById(user1.getId());
    const foundUser2 = await userRepository.findById(user2.getId());

    expect(foundUser1?.isDeleted()).toBe(true);
    expect(foundUser2?.isDeleted()).toBe(false);
  });
});
