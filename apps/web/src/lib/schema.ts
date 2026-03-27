import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  decimal,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  description: text('description').notNull(),
  isOrganic: boolean('is_organic').default(false),
  climateZones: text('climate_zones').array(),
  sowMonths: integer('sow_months').array(),
  harvestMonths: integer('harvest_months').array(),
  waterNeeds: integer('water_needs'),
  sunNeeds: integer('sun_needs'),
  careLevel: integer('care_level'),
  spaceNeeded: text('space_needed'),
  germinationRate: decimal('germination_rate', { precision: 5, scale: 2 }),
  daysToGerminate: integer('days_to_germinate'),
  daysToHarvest: integer('days_to_harvest'),
  weightOptions: jsonb('weight_options'),
  images: text('images').array(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').default(0),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  status: text('status').default('pending'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).default('0'),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method'),
  paymentIntentId: text('payment_intent_id'),
  shippingAddress: jsonb('shipping_address'),
  trackingNumber: text('tracking_number'),
  notes: text('notes'),
  discountCodeId: uuid('discount_code_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Order items
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull(),
  productId: uuid('product_id').notNull(),
  productName: text('product_name').notNull(),
  variantG: integer('variant_g').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
});

// Users (extends Supabase auth.users)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // References auth.users.id
  email: text('email').notNull().unique(),
  name: text('name'),
  phone: text('phone'),
  role: text('role').default('cliente'), // cliente | admin | mayoreo
  climateZone: text('climate_zone'), // costera_humeda | seca_calida | templada | fria_montana
  emailConfirmedAt: timestamp('email_confirmed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Addresses
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  street: text('street').notNull(),
  exteriorNumber: text('exterior_number').notNull(),
  interiorNumber: text('interior_number'),
  neighborhood: text('neighborhood').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  phone: text('phone').notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Discount codes
export const discountCodes = pgTable('discount_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
