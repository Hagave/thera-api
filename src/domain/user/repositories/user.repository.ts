import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<User>;
  list(page: number, limit: number): Promise<{ users: User[]; total: number }>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
