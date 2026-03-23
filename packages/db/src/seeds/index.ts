import 'dotenv/config';
import { seed as categoriesSeed } from './categories';
import { seed as productsSeed } from './products';
import { seed as productsRegionalSeed } from './products-regional';
import { seed as discountsSeed } from './discounts';
import { seed as usersSeed } from './users';
import { seed as addressesSeed } from './addresses';
import { seed as ordersSeed } from './orders';
import { seed as reviewsSeed } from './reviews';

export async function seedAll() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Phase 1: Core entities without dependencies
    console.log('📦 Phase 1: Core entities');
    await categoriesSeed();    // 1. Sin dependencias
    await productsSeed();      // 2. Sin dependencias (base products)
    await productsRegionalSeed(); // 3. Productos regionales (depende de categories)
    
    // Phase 2: Independent entities
    console.log('\n📦 Phase 2: Independent entities');
    await discountsSeed();     // 4. Sin dependencias
    await usersSeed();        // 5. Sin dependencias

    // Phase 3: Entities with dependencies
    console.log('\n📦 Phase 3: Dependent entities');
    await addressesSeed();    // 6. Requiere users
    await ordersSeed();        // 7. Requiere users + products
    await reviewsSeed();       // 8. Requiere users + products

    console.log('\n🎉 All seeds completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  }
}

// Entry point
seedAll().catch((error) => {
  console.error('Unhandled seed error:', error);
  process.exit(1);
});
