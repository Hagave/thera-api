import { User } from '@domain/user/entities/user.entity';
import { Email } from '@shared/value-objects/email.vo';
import { randomUUID } from 'crypto';

type Override = {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export function makeUser(override: Override = {}): User {
  return new User({
    id: override.id ?? randomUUID(),
    name: override.name ?? 'John Doe',
    email: new Email(override.email ?? 'john@example.com'),
    password: override.password ?? '123456',
    createdAt: override.createdAt ?? new Date(),
    updatedAt: override.updatedAt ?? new Date(),
    deletedAt: override.deletedAt,
  });
}
