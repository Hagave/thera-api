import { ListUsersUseCase } from '@application/usecases/user/list/list-users.use-case';
import { InMemoryUserRepository } from '@infrastructure/repositories/in-memory/in-memory.user.repository';
import { describe, it, expect, beforeEach } from 'vitest';
import { makeUser } from './factory/make-user.factory';

describe('ListUsersUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let useCase: ListUsersUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    useCase = new ListUsersUseCase(userRepository);
  });

  it('should list users with pagination', async () => {
    for (let i = 0; i < 10; i++) {
      await userRepository.create(makeUser({ email: `user${i}@example.com` }));
    }

    const result = await useCase.execute({
      page: 1,
      limit: 5,
    });

    expect(result.users).toHaveLength(5);
    expect(result.total).toBe(10);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  it('should return correct users for second page', async () => {
    for (let i = 0; i < 10; i++) {
      await userRepository.create(makeUser({ email: `user${i}@example.com` }));
    }

    const result = await useCase.execute({
      page: 2,
      limit: 5,
    });

    expect(result.users).toHaveLength(5);
    expect(result.page).toBe(2);
  });

  it('should return empty list when no users exist', async () => {
    const result = await useCase.execute({
      page: 1,
      limit: 10,
    });

    expect(result.users).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it('should not include deleted users (if repository filters)', async () => {
    const activeUser = makeUser({ email: 'active@example.com' });
    const deletedUser = makeUser({ email: 'deleted@example.com' });

    deletedUser.delete();

    await userRepository.create(activeUser);
    await userRepository.create(deletedUser);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
    });

    expect(result.users).toHaveLength(1);
    expect(result.users[0].email).toBe('active@example.com');
  });

  it('should calculate totalPages correctly when not divisible', async () => {
    for (let i = 0; i < 7; i++) {
      await userRepository.create(makeUser({ email: `user${i}@example.com` }));
    }

    const result = await useCase.execute({
      page: 1,
      limit: 5,
    });

    expect(result.total).toBe(7);
    expect(result.totalPages).toBe(2);
  });

  it('should not leak sensitive fields', async () => {
    const user = makeUser({
      password: 'hashed-password',
    });

    await userRepository.create(user);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
    });

    expect(result.users[0]).not.toHaveProperty('password');
    expect(result.users[0]).not.toHaveProperty('deletedAt');
  });
});
