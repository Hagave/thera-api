import { hash } from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';

export async function users(prisma: PrismaClient) {
  const hashedPassword = await hash('Admin@123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Seed completed!');
  console.log(`👤 Admin: ${admin.email} / Admin@123`);
}
