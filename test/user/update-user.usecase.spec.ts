import { describe, it, expect, beforeEach, vi } from 'vitest';

import { UserNotFoundException } from '@domain/user/exceptions/user-not-found.exception';
import { EmailAlreadyExistsException } from '@domain/user/exceptions/email-already-exists.exception';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { InMemoryUserRepository } from '@infrastructure/repositories/in-memory/in-memory.user.repository';
import { UpdateUserUseCase } from '@application/usecases/user/update/update-user.use-case';
import { makeUser } from './factory/make-user.factory';

describe('UpdateUserUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let useCase: UpdateUserUseCase;
  let hashService: { hash: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();

    hashService = {
      hash: vi.fn(),
    };

    useCase = new UpdateUserUseCase(userRepository, hashService as any);
  });

  it('should update user name', async () => {
    const user = makeUser({ name: 'Old Name' });

    await userRepository.create(user);

    const result = await useCase.execute({
      id: user.getId(),
      name: 'New Name',
    });

    expect(result.name).toBe('New Name');

    const updated = await userRepository.findById(user.getId());
    expect(updated?.getName()).toBe('New Name');
  });

  it('should update user email', async () => {
    const user = makeUser({ email: 'old@example.com' });

    await userRepository.create(user);

    const result = await useCase.execute({
      id: user.getId(),
      email: 'new@example.com',
    });

    expect(result.email).toBe('new@example.com');
  });

  it('should update user password with hash', async () => {
    const user = makeUser({ password: 'old-password' });

    await userRepository.create(user);

    hashService.hash.mockResolvedValue('hashed-password'); // ✔ FIX

    await useCase.execute({
      id: user.getId(),
      password: 'Strong@123',
    });

    const updated = await userRepository.findById(user.getId());

    expect(hashService.hash).toHaveBeenCalledWith('Strong@123');
    expect(updated?.getPassword()).toBe('hashed-password');
  });

  it('should update multiple fields at once', async () => {
    const user = makeUser({
      name: 'Old Name',
      email: 'old@example.com',
    });

    await userRepository.create(user);

    const result = await useCase.execute({
      id: user.getId(),
      name: 'New Name',
      email: 'new@example.com',
    });

    expect(result.name).toBe('New Name');
    expect(result.email).toBe('new@example.com');
  });

  it('should throw if user does not exist', async () => {
    await expect(
      useCase.execute({
        id: 'non-existent-id',
        name: 'Test',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });

  it('should throw if user is deleted', async () => {
    const user = makeUser();

    user.delete();

    await userRepository.create(user);

    await expect(
      useCase.execute({
        id: user.getId(),
        name: 'Test',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });

  it('should throw if email already exists for another user', async () => {
    const user1 = makeUser({ email: 'user1@example.com' });
    const user2 = makeUser({ email: 'user2@example.com' });

    await userRepository.create(user1);
    await userRepository.create(user2);

    await expect(
      useCase.execute({
        id: user1.getId(),
        email: 'user2@example.com',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyExistsException);
  });

  it('should allow updating to same email', async () => {
    const user = makeUser({ email: 'same@example.com' });

    await userRepository.create(user);

    const result = await useCase.execute({
      id: user.getId(),
      email: 'same@example.com',
    });

    expect(result.email).toBe('same@example.com');
  });

  it('should throw for weak password', async () => {
    const user = makeUser();

    await userRepository.create(user);

    await expect(
      useCase.execute({
        id: user.getId(),
        password: '123',
      }),
    ).rejects.toBeInstanceOf(ValidationException);

    expect(hashService.hash).not.toHaveBeenCalled(); // ✔ importante
  });

  it('should not update anything if no fields provided', async () => {
    const user = makeUser({
      name: 'Original Name',
      email: 'original@example.com',
    });

    await userRepository.create(user);

    const result = await useCase.execute({
      id: user.getId(),
    });

    expect(result.name).toBe('Original Name');
    expect(result.email).toBe('original@example.com');
  });
});
