import 'dotenv/config';
import { db } from '../client';
import { reviews } from '../schema/orders';
import { products } from '../schema/products';
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
  console.log('🔄 Seeding reviews...');

  // Clear existing reviews for idempotency
  await db.execute(sql`DELETE FROM reviews`);

  // Get product IDs from database
  const productList = await db.select({ id: products.id, slug: products.slug }).from(products);
  const productMap = new Map(productList.map(p => [p.slug, p]));

  const now = new Date();

  // Reviews data: mix of positive (4-5), neutral (3), and critical (1-2)
  const reviewsData = [
    // Positive reviews (6)
    {
      id: generateDeterministicId('review-tomate-cherry-1'),
      productSlug: 'tomate-cherry',
      userId: userIds.maria,
      rating: 5,
      title: '¡Excelente germinación!',
      content: 'Compré hace 2 meses y ya tengo mis primeros tomates cherry. La germinación fue excelente, casi todas las semillas brotaron. Muy recomendado para principiantes.',
      verifiedPurchase: true,
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: generateDeterministicId('review-albahaca-1'),
      productSlug: 'albahaca',
      userId: userIds.carlos,
      rating: 5,
      title: 'Perfecta para mi huerto urbano',
      content: 'La albahaca creció magnifique. La uso para pesto y para cocina italiana. El aroma es increíble. Voy a comprar más.',
      verifiedPurchase: true,
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      id: generateDeterministicId('review-cilantro-1'),
      productSlug: 'cilantro',
      userId: userIds.laura,
      rating: 4,
      title: 'Buen producto',
      content: 'El cilantro creció sin problemas. Lo uso todas las semanas para salsa verde. El único detalle es que algunas semillas tardaron más en germinar.',
      verifiedPurchase: true,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      id: generateDeterministicId('review-composta-1'),
      productSlug: 'composta-premium',
      userId: userIds.vivero,
      rating: 5,
      title: 'Calidad profesional',
      content: 'Somos vivero y hemos probado varias compostas. Esta es de las mejores que hemos encontrado. Nuestras plantas se ven healthier.',
      verifiedPurchase: true,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: generateDeterministicId('review-girasol-1'),
      productSlug: 'girasol',
      userId: userIds.maria,
      rating: 5,
      title: 'Hermosos girasoles',
      content: 'Plante en mi jardín y los girasoles quedaron espectaculares. Atraen muchos polinizadores. Excelente relación precio-calidad.',
      verifiedPurchase: true,
      createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
    },
    {
      id: generateDeterministicId('review-cempasuchil-1'),
      productSlug: 'cempasuchil',
      userId: userIds.carlos,
      rating: 4,
      title: 'Buena calidad para Día de Muertos',
      content: 'Cultivé mis propios cempasúchiles para la ofrenda familiar. Quedaron preciosos con ese color naranja intenso. Muy buena opción.',
      verifiedPurchase: true,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
    // Neutral reviews (2)
    {
      id: generateDeterministicId('review-chile-serrano-1'),
      productSlug: 'chile-serrano',
      userId: userIds.laura,
      rating: 3,
      title: 'Crecimiento lento pero OK',
      content: 'El chile serrano germinó bien pero el crecimiento fue más lento de lo esperado. Después de 3 meses ya produce pero no tan abundante como esperaba. Calidad aceptable.',
      verifiedPurchase: true,
      createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    },
    {
      id: generateDeterministicId('review-humus-1'),
      productSlug: 'humus-de-lombriz',
      userId: userIds.maria,
      rating: 3,
      title: 'Funciona, pero...',
      content: 'El humus de lombriz es bueno para mis plántulas. Lo mezclo con tierra y funciona bien. Lo único es que llegó un poco húmedo, quizás por el empaque.',
      verifiedPurchase: true,
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    },
    // Critical reviews (2)
    {
      id: generateDeterministicId('review-lavanda-1'),
      productSlug: 'lavanda',
      userId: userIds.carlos,
      rating: 2,
      title: 'Germinación muy baja',
      content: 'De 20 semillas solo germinaron 4. La germinación fue muy inferior a lo que dice el paquete. Probablemente semillas muy viejas. No lo recomiendo.',
      verifiedPurchase: true,
      createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
    },
    {
      id: generateDeterministicId('review-tierra-1'),
      productSlug: 'tierra-preparada-universal',
      userId: userIds.laura,
      rating: 2,
      title: 'Tiene piedras y palos',
      content: 'La tierra vino con muchas impurezas: piedritas, palitos y hasta un poco de plástico. Tuve que cribarla antes de usar. Esperaba mejor calidad para el precio.',
      verifiedPurchase: true,
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
    },
  ];

  let insertedCount = 0;
  for (const review of reviewsData) {
    const product = productMap.get(review.productSlug);
    if (product) {
      await db.insert(reviews).values({
        id: review.id,
        productId: product.id,
        userId: review.userId,
        rating: review.rating,
        title: review.title,
        content: review.content,
        images: null,
        verifiedPurchase: review.verifiedPurchase,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      });
      insertedCount++;
    } else {
      console.warn(`⚠️ Product not found for review: ${review.productSlug}`);
    }
  }

  console.log(`✅ ${insertedCount} reviews seeded`);
}
