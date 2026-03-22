import {
  pgTable,
  uuid,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

// Discount codes
export const discountCodes = pgTable(
  'discount_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull().unique(),
    type: text('type').notNull(), // percentage | fixed_mxn
    value: decimal('value', { precision: 10, scale: 2 }).notNull(),
    minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
    maxUses: integer('max_uses'),
    usedCount: integer('used_count').default(0),
    expiresAt: timestamp('expires_at'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_discount_codes_code').on(table.code),
  ]
);

// Orders
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'),
    status: text('status').default('pending'), // pending | paid | shipped | delivered | refunded
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    shippingCost: decimal('shipping_cost').default('0'),
    discount: decimal('discount').default('0'),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    paymentMethod: text('payment_method'), // oxxo | spei | card
    paymentIntentId: text('payment_intent_id'),
    shippingAddress: jsonb('shipping_address').$type<{
      name: string;
      street: string;
      exteriorNumber: string;
      interiorNumber?: string;
      neighborhood: string;
      city: string;
      state: string;
      postalCode: string;
      phone: string;
    }>(),
    trackingNumber: text('tracking_number'),
    notes: text('notes'),
    discountCodeId: uuid('discount_code_id'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_orders_user').on(table.userId),
    index('idx_orders_status').on(table.status),
    index('idx_orders_created').on(table.createdAt),
  ]
);

// Order items
export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull(),
    productId: uuid('product_id')
      .notNull(),
    productName: text('product_name').notNull(),
    variantG: integer('variant_g').notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [
    index('idx_order_items_order').on(table.orderId),
  ]
);

// Carts
export const carts = pgTable(
  'carts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'),
    sessionId: text('session_id'), // For guest carts
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_carts_user').on(table.userId),
    index('idx_carts_session').on(table.sessionId),
  ]
);

// Cart items
export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cartId: uuid('cart_id')
      .notNull(),
    productId: uuid('product_id')
      .notNull(),
    variantG: integer('variant_g').notNull(),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_cart_items_cart').on(table.cartId),
  ]
);

// Reviews
export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull(),
    userId: uuid('user_id')
      .notNull(),
    rating: integer('rating').notNull(), // 1-5
    title: text('title'),
    content: text('content'),
    images: text('images').array(),
    verifiedPurchase: boolean('verified_purchase').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_reviews_product').on(table.productId),
    index('idx_reviews_user').on(table.userId),
  ]
);

// Audit logs
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_audit_logs_user').on(table.userId),
    index('idx_audit_logs_created').on(table.createdAt),
  ]
);
