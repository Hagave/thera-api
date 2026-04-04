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
    prisma.product.create({
      data: {
        name: 'Monitor 27" 4K',
        category: 'Electronics',
        description: 'Ultra HD display',
        price: 2200.0,
        stock: 15,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Headset Gamer',
        category: 'Electronics',
        description: 'Surround 7.1 headset',
        price: 320.0,
        stock: 40,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Webcam Full HD',
        category: 'Electronics',
        description: '1080p streaming webcam',
        price: 280.0,
        stock: 25,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Office Chair',
        category: 'Furniture',
        description: 'Ergonomic office chair',
        price: 900.0,
        stock: 20,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Standing Desk',
        category: 'Furniture',
        description: 'Adjustable height desk',
        price: 1800.0,
        stock: 10,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Bookshelf',
        category: 'Furniture',
        description: 'Wooden bookshelf',
        price: 650.0,
        stock: 12,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Air Fryer',
        category: 'Appliances',
        description: 'Oil-free fryer',
        price: 500.0,
        stock: 25,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Microwave Oven',
        category: 'Appliances',
        description: '20L microwave',
        price: 600.0,
        stock: 18,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Blender',
        category: 'Appliances',
        description: 'High power blender',
        price: 300.0,
        stock: 22,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Clean Code',
        category: 'Books',
        description: 'A Handbook of Agile Software Craftsmanship',
        price: 120.0,
        stock: 100,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Design Patterns',
        category: 'Books',
        description: 'Reusable Object-Oriented Software',
        price: 150.0,
        stock: 80,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Refactoring',
        category: 'Books',
        description: 'Improving the Design of Existing Code',
        price: 130.0,
        stock: 70,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Dumbbell Set 20kg',
        category: 'Fitness',
        description: 'Adjustable dumbbells',
        price: 300.0,
        stock: 35,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Treadmill',
        category: 'Fitness',
        description: 'Electric running machine',
        price: 2500.0,
        stock: 8,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Yoga Mat',
        category: 'Fitness',
        description: 'Non-slip yoga mat',
        price: 90.0,
        stock: 60,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Backpack',
        category: 'Accessories',
        description: 'Waterproof backpack',
        price: 200.0,
        stock: 60,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smartwatch',
        category: 'Accessories',
        description: 'Fitness tracking smartwatch',
        price: 800.0,
        stock: 20,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sunglasses',
        category: 'Accessories',
        description: 'Polarized sunglasses',
        price: 180.0,
        stock: 45,
      },
    }),
  ]);
  console.log('✅ Seed completed!');
  console.log(`📦 Products created: ${products.length}`);
}
