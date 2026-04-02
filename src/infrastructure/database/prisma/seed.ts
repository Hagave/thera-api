import { hash } from 'bcrypt';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  console.log('🌱 Starting seed...');

  // Limpar dados existentes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário admin
  const hashedPassword = await hash('Admin@123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });

  // Criar produtos
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Notebook Dell',
        category: 'Electronics',
        description: 'High performance laptop',
        price: 3500.0,
        stock: 10,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mouse Logitech',
        category: 'Electronics',
        description: 'Wireless mouse',
        price: 150.0,
        stock: 50,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Keyboard Mechanical',
        category: 'Electronics',
        description: 'RGB mechanical keyboard',
        price: 450.0,
        stock: 30,
      },
    }),
  ]);

  console.log('✅ Seed completed!');
  console.log(`👤 Admin: ${admin.email} / Admin@123`);
  console.log(`📦 Products created: ${products.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
