import 'dotenv/config';
import { db } from '../client';
import { users } from '../schema/users';
import { sql } from 'drizzle-orm';
import { createHash } from 'crypto';

function generateDeterministicUuid(email: string): string {
  const hash = createHash('sha256').update(email).digest('hex');
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // SHA-256 produces 64 hex chars. We use positions:
  // 0-7 (8), 8-11 (4), 12-14 (3+1=4), 15-17 (3+1=4), 20-31 (12)
  const variantChar = ((parseInt(hash.slice(15, 16), 16) & 0x3) | 0x8).toString(16);
  return (
    hash.slice(0, 8) + '-' +
    hash.slice(8, 12) + '-' +
    '4' + hash.slice(12, 15) + '-' + // 4 + 3 = 4 chars
    variantChar + hash.slice(16, 19) + '-' + // 1 + 3 = 4 chars
    hash.slice(19, 31) // 12 chars
  );
}

export async function seed(): Promise<void> {
  console.log('🔄 Seeding users...');

  // Clear existing users for idempotency
  await db.execute(sql`TRUNCATE users RESTART IDENTITY CASCADE`);

  const now = new Date();
  const usersData = [
    {
      id: generateDeterministicUuid('admin@jardinverde.mx'),
      email: 'admin@jardinverde.mx',
      name: 'Admin Jardín Verde',
      phone: '312-123-4567',
      role: 'admin',
      climateZone: 'costera_humeda',
      emailConfirmedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      id: generateDeterministicUuid('maria.garcia@email.com'),
      email: 'maria.garcia@email.com',
      name: 'María García',
      phone: '312-987-6543',
      role: 'cliente',
      climateZone: 'templada',
      emailConfirmedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      id: generateDeterministicUuid('carlos.martinez@email.com'),
      email: 'carlos.martinez@email.com',
      name: 'Carlos Martínez',
      phone: '314-555-1234',
      role: 'cliente',
      climateZone: 'costera_humeda',
      emailConfirmedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: generateDeterministicUuid('laura.hernandez@email.com'),
      email: 'laura.hernandez@email.com',
      name: 'Laura Hernández',
      phone: '316-888-9999',
      role: 'cliente',
      climateZone: 'templada',
      emailConfirmedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: generateDeterministicUuid('vivero.colima@email.com'),
      email: 'vivero.colima@email.com',
      name: 'Vivero Colima',
      phone: '312-456-7890',
      role: 'mayoreo',
      climateZone: 'costera_humeda',
      emailConfirmedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];

  for (const user of usersData) {
    await db.insert(users).values(user);
  }

  console.log(`✅ ${usersData.length} users seeded`);
}

// Export user IDs for use by other seeds
export const userIds = {
  admin: generateDeterministicUuid('admin@jardinverde.mx'),
  maria: generateDeterministicUuid('maria.garcia@email.com'),
  carlos: generateDeterministicUuid('carlos.martinez@email.com'),
  laura: generateDeterministicUuid('laura.hernandez@email.com'),
  vivero: generateDeterministicUuid('vivero.colima@email.com'),
};
