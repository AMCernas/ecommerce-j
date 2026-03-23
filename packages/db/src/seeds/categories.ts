import 'dotenv/config';
import { db } from '../client';
import { categories } from '../schema/products';
import { sql } from 'drizzle-orm';

export async function seed(): Promise<void> {
  console.log('🔄 Seeding categories...');

  const categoryData = [
    { name: 'Semillas', slug: 'semillas', description: 'Semillas de alta germinación para huertos urbanos y jardines' },
    { name: 'Tierra', slug: 'tierra', description: 'Tierra preparada y sustratos para jardín' },
    { name: 'Composta', slug: 'composta', description: 'Composta orgánica premium para enriquecer el suelo' },
    { name: 'Accesorios', slug: 'accesorios', description: 'Herramientas y accesorios para jardinería' },
  ];

  for (const cat of categoryData) {
    await db.execute(
      sql`INSERT INTO categories (name, slug, description) VALUES (${cat.name}, ${cat.slug}, ${cat.description}) ON CONFLICT (slug) DO NOTHING`
    );
  }

  console.log('✅ Categories seeded');
}
