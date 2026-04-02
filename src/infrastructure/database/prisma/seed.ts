import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from './generated/prisma/client';
import { products } from './seeds/products';
import { users } from './seeds/users';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type SeedFunction = (prisma: PrismaClient) => Promise<void>;

interface Seed {
  name: string;
  run: SeedFunction;
}

const seeds: Seed[] = [
  {
    name: 'Products',
    run: products,
  },
  {
    name: 'Users',
    run: users,
  },
];

async function main() {
  console.log('🌱 Starting database seeding...\n');

  for (const seed of seeds) {
    try {
      console.log(`📦 Running seed: ${seed.name}...`);
      await seed.run(prisma);
      console.log(`✅ ${seed.name} seed completed\n`);
    } catch (error) {
      console.error(`❌ Error running ${seed.name} seed:`, error);
      throw error;
    }
  }

  console.log('🎉 All seeds completed successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
