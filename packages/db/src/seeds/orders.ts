import 'dotenv/config';
import { db } from '../client';
import { orders, orderItems, discountCodes } from '../schema/orders';
import { products } from '../schema/products';
import { addresses } from '../schema/users';
import { sql, eq } from 'drizzle-orm';
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
  console.log('🔄 Seeding orders...');

  // Clear existing orders and order items for idempotency
  await db.execute(sql`TRUNCATE order_items RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE orders RESTART IDENTITY CASCADE`);

  const now = new Date();

  // Get product IDs from database
  const productList = await db.select({ id: products.id, slug: products.slug, price: products.price }).from(products);
  const productMap = new Map(productList.map(p => [p.slug, p]));

  // Get discount code IDs
  const discountList = await db.select({ id: discountCodes.id, code: discountCodes.code }).from(discountCodes);
  const discountMap = new Map(discountList.map(d => [d.code, d]));

  // Get addresses for shipping
  const addressesList = await db.select().from(addresses).where(eq(addresses.userId, userIds.maria)).limit(1);
  
  // Shipping address template
  const shippingAddress = {
    name: 'María García',
    street: 'Av. Fray Pedro de Gante',
    exteriorNumber: '45',
    neighborhood: 'Elitech',
    city: 'Colima',
    state: 'Colima',
    postalCode: '28010',
    phone: '312-987-6543',
  };

  // Order 1: Pending (no payment)
  const order1Id = generateDeterministicId('order-pending');
  await db.insert(orders).values({
    id: order1Id,
    userId: userIds.maria,
    status: 'pending',
    subtotal: '105.00',
    shippingCost: '89.00',
    discount: '0.00',
    total: '194.00',
    paymentMethod: null,
    paymentIntentId: null,
    shippingAddress: shippingAddress,
    trackingNumber: null,
    notes: null,
    discountCodeId: null,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  });

  const tomateCherry = productMap.get('tomate-cherry');
  const chileSerrano = productMap.get('chile-serrano');
  if (tomateCherry && chileSerrano) {
    await db.insert(orderItems).values([
      {
        orderId: order1Id,
        productId: tomateCherry.id,
        productName: 'Tomate Cherry',
        variantG: 50,
        quantity: 2,
        unitPrice: '35.00',
        totalPrice: '70.00',
      },
      {
        orderId: order1Id,
        productId: chileSerrano.id,
        productName: 'Chile Serrano',
        variantG: 100,
        quantity: 1,
        unitPrice: '35.00',
        totalPrice: '35.00',
      },
    ]);
  }

  // Order 2: Paid (spei)
  const order2Id = generateDeterministicId('order-paid');
  const descuentoBienvenida = discountMap.get('BIENVENIDA');
  await db.insert(orders).values({
    id: order2Id,
    userId: userIds.carlos,
    status: 'paid',
    subtotal: '32.00',
    shippingCost: '89.00',
    discount: '3.20', // 10% of subtotal
    total: '117.80',
    paymentMethod: 'spei',
    paymentIntentId: 'pi_test_paid_spei_' + Date.now(),
    shippingAddress: {
      name: 'Carlos Martínez',
      street: 'Blvd. Camino Real',
      exteriorNumber: '123',
      neighborhood: 'San José',
      city: 'Colima',
      state: 'Colima',
      postalCode: '28017',
      phone: '314-555-1234',
    },
    trackingNumber: null,
    notes: null,
    discountCodeId: descuentoBienvenida?.id || null,
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  });

  const jitomate = productMap.get('jitomate-saladette');
  if (jitomate) {
    await db.insert(orderItems).values({
      orderId: order2Id,
      productId: jitomate.id,
      productName: 'Jitomate Saladette',
      variantG: 50,
      quantity: 1,
      unitPrice: '32.00',
      totalPrice: '32.00',
    });
  }

  // Order 3: Shipped (card)
  const order3Id = generateDeterministicId('order-shipped');
  await db.insert(orders).values({
    id: order3Id,
    userId: userIds.laura,
    status: 'shipped',
    subtotal: '147.00',
    shippingCost: '89.00',
    discount: '0.00',
    total: '236.00',
    paymentMethod: 'card',
    paymentIntentId: 'pi_test_shipped_card_' + Date.now(),
    shippingAddress: {
      name: 'Laura Hernández',
      street: 'Calle Santiago',
      exteriorNumber: '234',
      interiorNumber: '3',
      neighborhood: 'Santiago',
      city: 'Manzanillo',
      state: 'Colima',
      postalCode: '28860',
      phone: '316-888-9999',
    },
    trackingNumber: 'MEXR123456789MX',
    notes: 'Entregar en horarios de oficina',
    discountCodeId: null,
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  });

  const albahaca = productMap.get('albahaca');
  const cilantro = productMap.get('cilantro');
  const girasol = productMap.get('girasol');
  if (albahaca && cilantro && girasol) {
    await db.insert(orderItems).values([
      { orderId: order3Id, productId: albahaca.id, productName: 'Albahaca', variantG: 100, quantity: 1, unitPrice: '85.00', totalPrice: '85.00' },
      { orderId: order3Id, productId: cilantro.id, productName: 'Cilantro', variantG: 100, quantity: 2, unitPrice: '22.00', totalPrice: '44.00' },
      { orderId: order3Id, productId: girasol.id, productName: 'Girasol', variantG: 200, quantity: 1, unitPrice: '18.00', totalPrice: '18.00' },
    ]);
  }

  // Order 4: Delivered (oxxo) with ENVIOGRATIS
  const order4Id = generateDeterministicId('order-delivered');
  const envioGratis = discountMap.get('ENVIOGRATIS');
  await db.insert(orders).values({
    id: order4Id,
    userId: userIds.vivero,
    status: 'delivered',
    subtotal: '320.00',
    shippingCost: '0.00', // Free shipping
    discount: '0.00',
    total: '320.00',
    paymentMethod: 'oxxo',
    paymentIntentId: 'pi_test_delivered_oxxo_' + Date.now(),
    shippingAddress: {
      name: 'Vivero Colima',
      street: 'Av. Tecnológico',
      exteriorNumber: '567',
      neighborhood: 'Centro',
      city: 'Villa de Álvarez',
      state: 'Colima',
      postalCode: '28970',
      phone: '312-456-7890',
    },
    trackingNumber: 'MEXR987654321MX',
    notes: 'Llamar antes de entregar',
    discountCodeId: envioGratis?.id || null,
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  });

  const compostaPremium = productMap.get('composta-premium');
  const humusLombriz = productMap.get('humus-de-lombriz');
  if (compostaPremium && humusLombriz) {
    await db.insert(orderItems).values([
      { orderId: order4Id, productId: compostaPremium.id, productName: 'Composta Premium', variantG: 20000, quantity: 1, unitPrice: '280.00', totalPrice: '280.00' },
      { orderId: order4Id, productId: humusLombriz.id, productName: 'Humus de Lombriz', variantG: 10000, quantity: 1, unitPrice: '40.00', totalPrice: '40.00' },
    ]);
  }

  // Order 5: Cancelled
  const order5Id = generateDeterministicId('order-cancelled');
  await db.insert(orders).values({
    id: order5Id,
    userId: userIds.maria,
    status: 'cancelled',
    subtotal: '95.00',
    shippingCost: '89.00',
    discount: '0.00',
    total: '184.00',
    paymentMethod: 'spei',
    paymentIntentId: 'pi_test_cancelled_' + Date.now(),
    shippingAddress: shippingAddress,
    trackingNumber: null,
    notes: 'Cliente canceló por cambio de opinión',
    discountCodeId: null,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  });

  const macetaBarro = productMap.get('maceta-barro-10');
  if (macetaBarro) {
    await db.insert(orderItems).values({
      orderId: order5Id,
      productId: macetaBarro.id,
      productName: 'Maceta de Barro #10',
      variantG: 1000,
      quantity: 1,
      unitPrice: '95.00',
      totalPrice: '95.00',
    });
  }

  console.log('✅ 5 orders seeded with order items');
}
