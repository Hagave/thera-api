import { User } from '@domain/user/entities/user.entity';
import { IUserRepository } from '@domain/user/repositories/user.repository';

export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();

  async create(user: User): Promise<User> {
    this.users.set(user.getId(), user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.getEmail().getValue() === email) {
        return user;
      }
    }
    return null;
  }

  async update(user: User): Promise<User> {
    if (!this.users.has(user.getId())) {
      throw new Error('User not found');
    }

    this.users.set(user.getId(), user);
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async list(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    const allUsers = Array.from(this.users.values()).filter((user) => !user.isDeleted()); // 👈 ESSENCIAL

    const total = allUsers.length;

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      users: allUsers.slice(start, end),
      total,
    };
  }
}
