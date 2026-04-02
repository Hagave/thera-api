import { User } from '@domain/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@infrastructure/database/prisma/generated/prisma/client';
import { Email } from '@shared/value-objects/email.vo';

@Injectable()
export class UserMapper {
  toDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      name: prismaUser.name,
      email: new Email(prismaUser.email),
      password: prismaUser.password,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      deletedAt: prismaUser.deletedAt || undefined,
    });
  }

  toPrisma(user: User): Omit<PrismaUser, 'createdAt' | 'updatedAt' | 'deletedAt'> {
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      password: user.getPassword(),
    };
  }

  toPrismaCreate(user: User) {
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      password: user.getPassword(),
    };
  }

  toPrismaUpdate(user: User) {
    return {
      name: user.getName(),
      email: user.getEmail().getValue(),
      password: user.getPassword(),
      deletedAt: user.getDeletedAt(),
    };
  }
}
