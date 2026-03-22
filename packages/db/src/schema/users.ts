import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

// Users table - extends Supabase auth.users
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(), // References auth.users.id
    email: text('email').notNull().unique(),
    name: text('name'),
    phone: text('phone'),
    role: text('role').default('cliente'), // cliente | admin | mayoreo
    climateZone: text('climate_zone'), // costera_humeda | seca_calida | templada | fria_montana
    emailConfirmedAt: timestamp('email_confirmed_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_users_email').on(table.email),
    index('idx_users_role').on(table.role),
  ]
);

// Addresses
export const addresses = pgTable(
  'addresses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
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
  },
  (table) => [
    index('idx_addresses_user').on(table.userId),
  ]
);
