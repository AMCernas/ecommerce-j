import 'dotenv/config';
import { db } from '../client';
import { addresses } from '../schema/users';
import { sql } from 'drizzle-orm';
import { createHash } from 'crypto';

function generateDeterministicUuid(email: string): string {
  const hash = createHash('sha256').update(email).digest('hex');
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const variantChar = ((parseInt(hash.slice(15, 16), 16) & 0x3) | 0x8).toString(16);
  return (
    hash.slice(0, 8) + '-' +
    hash.slice(8, 12) + '-' +
    '4' + hash.slice(12, 15) + '-' +
    variantChar + hash.slice(16, 19) + '-' +
    hash.slice(19, 31)
  );
}

function generateDeterministicId(seed: string): string {
  const hash = createHash('sha256').update(seed).digest('hex');
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const variantChar = ((parseInt(hash.slice(15, 16), 16) & 0x3) | 0x8).toString(16);
  return (
    hash.slice(0, 8) + '-' +
    hash.slice(8, 12) + '-' +
    '4' + hash.slice(12, 15) + '-' +
    variantChar + hash.slice(16, 19) + '-' +
    hash.slice(19, 31)
  );
}

// User IDs (same as users.ts)
const userIds = {
  admin: generateDeterministicUuid('admin@jardinverde.mx'),
  maria: generateDeterministicUuid('maria.garcia@email.com'),
  carlos: generateDeterministicUuid('carlos.martinez@email.com'),
  laura: generateDeterministicUuid('laura.hernandez@email.com'),
  vivero: generateDeterministicUuid('vivero.colima@email.com'),
};

export async function seed(): Promise<void> {
  console.log('🔄 Seeding addresses...');

  // Clear existing addresses for idempotency
  await db.execute(sql`TRUNCATE addresses RESTART IDENTITY CASCADE`);

  const addressesData = [
    // Colima Capital (CP 28000-28499)
    {
      id: generateDeterministicId('address-colima-1'),
      userId: userIds.maria,
      name: 'María García',
      street: 'Av. Fray Pedro de Gante',
      exteriorNumber: '45',
      interiorNumber: null,
      neighborhood: 'Elitech',
      city: 'Colima',
      state: 'Colima',
      postalCode: '28010',
      phone: '312-987-6543',
      isDefault: true,
    },
    {
      id: generateDeterministicId('address-colima-2'),
      userId: userIds.maria,
      name: 'María García',
      street: 'Calle Manuel Álvarez',
      exteriorNumber: '78',
      interiorNumber: 'B',
      neighborhood: 'Centro',
      city: 'Colima',
      state: 'Colima',
      postalCode: '28000',
      phone: '312-987-6543',
      isDefault: false,
    },
    {
      id: generateDeterministicId('address-colima-3'),
      userId: userIds.carlos,
      name: 'Carlos Martínez',
      street: 'Blvd. Camino Real',
      exteriorNumber: '123',
      interiorNumber: null,
      neighborhood: 'San José',
      city: 'Colima',
      state: 'Colima',
      postalCode: '28017',
      phone: '314-555-1234',
      isDefault: true,
    },
    {
      id: generateDeterministicId('address-colima-4'),
      userId: userIds.admin,
      name: 'Admin Jardín Verde',
      street: 'Calle Gral. Miguel negrete',
      exteriorNumber: '890',
      interiorNumber: null,
      neighborhood: 'Centro',
      city: 'Colima',
      state: 'Colima',
      postalCode: '28020',
      phone: '312-123-4567',
      isDefault: true,
    },
    // Manzanillo (CP 28860-28999)
    {
      id: generateDeterministicId('address-manzanillo-1'),
      userId: userIds.carlos,
      name: 'Carlos Martínez',
      street: 'Av. La Playa',
      exteriorNumber: '56',
      interiorNumber: null,
      neighborhood: 'Las Brisas',
      city: 'Manzanillo',
      state: 'Colima',
      postalCode: '28869',
      phone: '314-555-1234',
      isDefault: false,
    },
    {
      id: generateDeterministicId('address-manzanillo-2'),
      userId: userIds.laura,
      name: 'Laura Hernández',
      street: 'Calle Santiago',
      exteriorNumber: '234',
      interiorNumber: '3',
      neighborhood: 'Santiago',
      city: 'Manzanillo',
      state: 'Colima',
      postalCode: '28860',
      phone: '316-888-9999',
      isDefault: true,
    },
    {
      id: generateDeterministicId('address-manzanillo-3'),
      userId: userIds.laura,
      name: 'Laura Hernández',
      street: 'Camino a El Colomo',
      exteriorNumber: '15',
      interiorNumber: null,
      neighborhood: 'El Colomo',
      city: 'Manzanillo',
      state: 'Colima',
      postalCode: '28970',
      phone: '316-888-9999',
      isDefault: false,
    },
    // Villa de Álvarez (CP 28970-28999)
    {
      id: generateDeterministicId('address-villa-1'),
      userId: userIds.vivero,
      name: 'Vivero Colima',
      street: 'Av. Tecnológico',
      exteriorNumber: '567',
      interiorNumber: null,
      neighborhood: 'Centro',
      city: 'Villa de Álvarez',
      state: 'Colima',
      postalCode: '28970',
      phone: '312-456-7890',
      isDefault: true,
    },
    {
      id: generateDeterministicId('address-villa-2'),
      userId: userIds.vivero,
      name: 'Vivero Colima - Almacén',
      street: 'Calle Dulcer Nopal',
      exteriorNumber: '89',
      interiorNumber: null,
      neighborhood: 'Dulcer Nopal',
      city: 'Villa de Álvarez',
      state: 'Colima',
      postalCode: '28985',
      phone: '312-456-7890',
      isDefault: false,
    },
    {
      id: generateDeterministicId('address-villa-3'),
      userId: userIds.admin,
      name: 'Admin Jardín Verde - Entrega',
      street: 'Calle La Cantera',
      exteriorNumber: '34',
      interiorNumber: null,
      neighborhood: 'Las Fuentes',
      city: 'Villa de Álvarez',
      state: 'Colima',
      postalCode: '28995',
      phone: '312-123-4567',
      isDefault: false,
    },
  ];

  for (const address of addressesData) {
    await db.insert(addresses).values(address);
  }

  console.log(`✅ ${addressesData.length} addresses seeded`);
}
