import 'dotenv/config';
import { db } from '../client';
import { discountCodes } from '../schema/orders';
import { sql } from 'drizzle-orm';

export async function seed(): Promise<void> {
  console.log('🔄 Seeding discount codes...');

  // Clear existing discount codes for idempotency
  await db.execute(sql`TRUNCATE discount_codes RESTART IDENTITY CASCADE`);

  const discounts = [
    {
      code: 'BIENVENIDA',
      type: 'percentage',
      value: '10.00',
      minOrderAmount: null,
      maxUses: 1000,
      usedCount: 0,
      expiresAt: null,
      isActive: true,
    },
    {
      code: 'ENVIOGRATIS',
      type: 'fixed_mxn',
      value: '150.00',
      minOrderAmount: '300.00',
      maxUses: null,
      usedCount: 0,
      expiresAt: null,
      isActive: true,
    },
    {
      code: 'PRINCIPIANTE',
      type: 'percentage',
      value: '15.00',
      minOrderAmount: '200.00',
      maxUses: 500,
      usedCount: 0,
      expiresAt: null,
      isActive: true,
    },
  ];

  for (const discount of discounts) {
    await db.insert(discountCodes).values(discount);
  }

  console.log(`✅ ${discounts.length} discount codes seeded`);
}
