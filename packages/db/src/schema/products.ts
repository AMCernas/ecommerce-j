import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  decimal,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    category: text('category').notNull(), // semilla | tierra | composta | accesorio
    subcategory: text('subcategory'), // hortaliza | flor | árbol | hierba | ornamental
    description: text('description').notNull(),
    isOrganic: boolean('is_organic').default(false),
    climateZones: text('climate_zones').array(), // GIN index
    sowMonths: integer('sow_months').array(), // 1-12
    harvestMonths: integer('harvest_months').array(), // 1-12
    waterNeeds: integer('water_needs'), // 1 | 2 | 3
    sunNeeds: integer('sun_needs'), // 1 | 2 | 3
    careLevel: integer('care_level'), // 1 | 2 | 3
    spaceNeeded: text('space_needed'), // maceta_pequeña | maceta_grande | jardín | campo
    germinationRate: decimal('germination_rate', { precision: 5, scale: 2 }),
    daysToGerminate: integer('days_to_germinate'),
    daysToHarvest: integer('days_to_harvest'),
    weightOptions: jsonb('weight_options').$type<
      Array<{ g: number; price: number; stock: number }>
    >(),
    images: text('images').array(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    stock: integer('stock').default(0),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    isArchived: boolean('is_archived').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_products_climate').using('gin', table.climateZones),
    index('idx_products_sow').using('gin', table.sowMonths),
    index('idx_products_resources').on(
      table.waterNeeds,
      table.careLevel,
      table.sunNeeds
    ),
    index('idx_products_category').on(table.category, table.isOrganic),
    index('idx_products_slug').on(table.slug),
  ]
);

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const productCategories = pgTable(
  'product_categories',
  {
    productId: uuid('product_id')
      .references(() => products.id)
      .notNull(),
    categoryId: uuid('category_id')
      .references(() => categories.id)
      .notNull(),
  },
  (table) => [index('idx_product_categories').on(table.productId, table.categoryId)]
);
