import { GetUserUseCase } from '@application/usecases/user/get/get-user.use-case';
import { InMemoryUserRepository } from '@infrastructure/repositories/in-memory/in-memory.user.repository';
import { describe, it, expect, beforeEach } from 'vitest';
import { makeUser } from './factory/make-user.factory';
import { UserNotFoundException } from '@domain/user/exceptions/user-not-found.exception';

describe('GetUserUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let useCase: GetUserUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    useCase = new GetUserUseCase(userRepository);
  });

  it('should return user data successfully', async () => {
    const user = makeUser({
      name: 'John Doe',
      email: 'john@example.com',
    });

    await userRepository.create(user);

    const result = await useCase.execute({
      id: user.getId(),
    });

    expect(result).toEqual({
      id: user.getId(),
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    });
  });

  it('should throw if user does not exist', async () => {
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });

  it('should throw if user is deleted', async () => {
    const user = makeUser();

    user.delete(); // soft delete no domínio

    await userRepository.create(user);

    await expect(useCase.execute({ id: user.getId() })).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });

  it('should not leak sensitive or internal fields', async () => {
    const user = makeUser({
      password: 'hashed-password',
    });

    await userRepository.create(user);

    const result = await useCase.execute({
      id: user.getId(),
    });

    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('deletedAt');
  });

  it('should return correct timestamps', async () => {
    const createdAt = new Date('2024-01-01');
    const updatedAt = new Date('2024-01-02');

    const user = makeUser({
      createdAt,
      updatedAt,
    });

    await userRepository.create(user);

    const result = await useCase.execute({
      id: user.getId(),
    });

    expect(result.createdAt).toEqual(createdAt);
    expect(result.updatedAt).toEqual(updatedAt);
  });
});
