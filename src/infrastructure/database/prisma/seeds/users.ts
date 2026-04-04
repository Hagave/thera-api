import { hash } from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';

export async function users(prisma: PrismaClient) {
  const hashedPassword = await hash('Admin@123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Michael Johnson',
        email: 'michael.johnson@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carlos Silva',
        email: 'carlos.silva@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ana Souza',
        email: 'ana.souza@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Lucas Pereira',
        email: 'lucas.pereira@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Mariana Costa',
        email: 'mariana.costa@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Fernando Oliveira',
        email: 'fernando.oliveira@example.com',
        password: hashedPassword,
      },
    }),
  ]);

  console.log('✅ Seed completed!');
  console.log(`👥 Users created: ${users.length}`);
  console.log(`🔑 Default password: Admin@123`);
}
