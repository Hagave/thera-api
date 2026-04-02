import { hash } from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';

export async function products(prisma: PrismaClient) {
  console.log('🌱 Starting seed...');

  // Limpar dados existentes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário admin

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
  console.log(`📦 Products created: ${products.length}`);
}
