import { User } from '@domain/user/entities/user.entity';
import { IUserRepository } from '@domain/user/repositories/user.repository';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { UserMapper } from '@infrastructure/mappers/user.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: UserMapper,
  ) {}

  async create(user: User): Promise<User> {
    const data = this.mapper.toPrismaCreate(user);
    const created = await this.prisma.user.create({ data });
    return this.mapper.toDomain(created);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.mapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.mapper.toDomain(user) : null;
  }

  async update(user: User): Promise<User> {
    const data = this.mapper.toPrismaUpdate(user);
    const updated = await this.prisma.user.update({
      where: { id: user.getId() },
      data,
    });
    return this.mapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async list(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: { deletedAt: null },
      }),
    ]);

    return {
      users: users.map((u) => this.mapper.toDomain(u)),
      total,
    };
  }
}
