import { InMemoryUserRepository } from '@infrastructure/repositories/in-memory/in-memory.user.repository';
import { describe, it, expect, beforeEach } from 'vitest';
import { makeUser } from './factory/make-user.factory';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it('should create and find user by id', async () => {
    const user = makeUser();

    await repository.create(user);

    const found = await repository.findById(user.getId());

    expect(found).toBeTruthy();
    expect(found?.getId()).toBe(user.getId());
  });

  it('should find user by email', async () => {
    const user = makeUser({ email: 'test@email.com' });

    await repository.create(user);

    const found = await repository.findByEmail('test@email.com');

    expect(found).toBeTruthy();
    expect(found?.getEmail().getValue()).toBe('test@email.com');
  });

  it('should return null when user not found', async () => {
    const found = await repository.findByEmail('notfound@email.com');

    expect(found).toBeNull();
  });

  it('should paginate users correctly', async () => {
    for (let i = 0; i < 10; i++) {
      await repository.create(makeUser());
    }

    const result = await repository.list(1, 5);

    expect(result.users).toHaveLength(5);
    expect(result.total).toBe(10);
  });

  it('should delete user', async () => {
    const user = makeUser();

    await repository.create(user);
    await repository.delete(user.getId());

    const found = await repository.findById(user.getId());

    expect(found).toBeNull();
  });
});
