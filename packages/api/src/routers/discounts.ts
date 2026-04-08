import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../context';
import { db, discountCodes, orders } from '@ecoomerce-jardineria/db';
import { eq, and, sql, desc } from 'drizzle-orm';
import { validateDiscountCode, calculateDiscount, type DiscountType } from '../utils/discount-validation';

// Input validation schemas
const createDiscountSchema = z.object({
  code: z.string().min(1).max(50).transform(val => val.toUpperCase().replace(/\s/g, '-')),
  type: z.enum(['percentage', 'fixed_mxn']),
  value: z.number().positive(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
});

const updateDiscountSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    code: z.string().min(1).max(50).transform(val => val.toUpperCase().replace(/\s/g, '-')).optional(),
    type: z.enum(['percentage', 'fixed_mxn']).optional(),
    value: z.number().positive().optional(),
    minOrderAmount: z.number().nonnegative().optional(),
    maxUses: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

const listDiscountsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  isActive: z.boolean().optional(),
});

export const discountsRouter = router({
  // List discounts with pagination and optional filter
  list: adminProcedure
    .input(listDiscountsSchema)
    .query(async ({ input }) => {
      const { page, limit, isActive } = input;
      const offset = (page - 1) * limit;

      // Build conditions
      const conditions = [];
      if (isActive !== undefined) {
        conditions.push(eq(discountCodes.isActive, isActive));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(discountCodes)
        .where(whereClause);

      const total = countResult?.count || 0;

      // Get discounts
      const discountList = await db
        .select()
        .from(discountCodes)
        .where(whereClause)
        .orderBy(desc(discountCodes.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        discounts: discountList.map(d => ({
          id: d.id,
          code: d.code,
          type: d.type as DiscountType,
          value: d.value,
          usedCount: d.usedCount,
          maxUses: d.maxUses,
          minOrderAmount: d.minOrderAmount,
          expiresAt: d.expiresAt,
          isActive: d.isActive,
          createdAt: d.createdAt,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get discount by ID
  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [discount] = await db
        .select()
        .from(discountCodes)
        .where(eq(discountCodes.id, input.id))
        .limit(1);

      if (!discount) {
        return null;
      }

      return {
        id: discount.id,
        code: discount.code,
        type: discount.type as DiscountType,
        value: discount.value,
        usedCount: discount.usedCount,
        maxUses: discount.maxUses,
        minOrderAmount: discount.minOrderAmount,
        expiresAt: discount.expiresAt,
        isActive: discount.isActive,
        createdAt: discount.createdAt,
      };
    }),

  // Create new discount
  create: adminProcedure
    .input(createDiscountSchema)
    .mutation(async ({ input }) => {
      // Check for duplicate code
      const [existing] = await db
        .select()
        .from(discountCodes)
        .where(eq(discountCodes.code, input.code))
        .limit(1);

      if (existing) {
        throw new Error(`El código ${input.code} ya existe`);
      }

      // Validate percentage max value
      if (input.type === 'percentage' && input.value > 100) {
        throw new Error('El valor máximo para porcentaje es 100');
      }

      const [discount] = await db
        .insert(discountCodes)
        .values({
          code: input.code,
          type: input.type,
          value: String(input.value),
          minOrderAmount: input.minOrderAmount ? String(input.minOrderAmount) : null,
          maxUses: input.maxUses || null,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          isActive: true,
          usedCount: 0,
        })
        .returning();

      return {
        id: discount.id,
        code: discount.code,
        type: discount.type as DiscountType,
        value: discount.value,
        usedCount: discount.usedCount,
        maxUses: discount.maxUses,
        minOrderAmount: discount.minOrderAmount,
        expiresAt: discount.expiresAt,
        isActive: discount.isActive,
        createdAt: discount.createdAt,
      };
    }),

  // Update discount
  update: adminProcedure
    .input(updateDiscountSchema)
    .mutation(async ({ input }) => {
      // Check if discount exists
      const [existing] = await db
        .select()
        .from(discountCodes)
        .where(eq(discountCodes.id, input.id))
        .limit(1);

      if (!existing) {
        throw new Error('Código de descuento no encontrado');
      }

      // Check for duplicate code if code is being changed
      if (input.data.code && input.data.code !== existing.code) {
        const [duplicate] = await db
          .select()
          .from(discountCodes)
          .where(eq(discountCodes.code, input.data.code))
          .limit(1);

        if (duplicate) {
          throw new Error(`El código ${input.data.code} ya existe`);
        }
      }

      // Validate percentage max value
      if (input.data.type === 'percentage' && input.data.value && input.data.value > 100) {
        throw new Error('El valor máximo para porcentaje es 100');
      }

      // Build update values
      const updateValues: Record<string, unknown> = {};
      
      if (input.data.code !== undefined) updateValues.code = input.data.code;
      if (input.data.type !== undefined) updateValues.type = input.data.type;
      if (input.data.value !== undefined) updateValues.value = String(input.data.value);
      if (input.data.minOrderAmount !== undefined) {
        updateValues.minOrderAmount = input.data.minOrderAmount ? String(input.data.minOrderAmount) : null;
      }
      if (input.data.maxUses !== undefined) updateValues.maxUses = input.data.maxUses;
      if (input.data.expiresAt !== undefined) {
        updateValues.expiresAt = input.data.expiresAt ? new Date(input.data.expiresAt) : null;
      }
      if (input.data.isActive !== undefined) updateValues.isActive = input.data.isActive;

      const [discount] = await db
        .update(discountCodes)
        .set(updateValues)
        .where(eq(discountCodes.id, input.id))
        .returning();

      return {
        id: discount.id,
        code: discount.code,
        type: discount.type as DiscountType,
        value: discount.value,
        usedCount: discount.usedCount,
        maxUses: discount.maxUses,
        minOrderAmount: discount.minOrderAmount,
        expiresAt: discount.expiresAt,
        isActive: discount.isActive,
        createdAt: discount.createdAt,
      };
    }),

  // Toggle discount active status
  toggle: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select()
        .from(discountCodes)
        .where(eq(discountCodes.id, input.id))
        .limit(1);

      if (!existing) {
        throw new Error('Código de descuento no encontrado');
      }

      const [discount] = await db
        .update(discountCodes)
        .set({ isActive: !existing.isActive })
        .where(eq(discountCodes.id, input.id))
        .returning();

      return {
        id: discount.id,
        code: discount.code,
        type: discount.type as DiscountType,
        value: discount.value,
        usedCount: discount.usedCount,
        maxUses: discount.maxUses,
        minOrderAmount: discount.minOrderAmount,
        expiresAt: discount.expiresAt,
        isActive: discount.isActive,
        createdAt: discount.createdAt,
      };
    }),

  // Delete (soft delete) discount
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      // Check if discount exists
      const [existing] = await db
        .select()
        .from(discountCodes)
        .where(eq(discountCodes.id, input.id))
        .limit(1);

      if (!existing) {
        throw new Error('Código de descuento no encontrado');
      }

      // Check for active orders using this discount
      const [orderCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(and(
          eq(orders.discountCodeId, input.id),
          sql`${orders.status} NOT IN ('refunded', 'cancelled')`
        ));

      if (orderCount && orderCount.count > 0) {
        throw new Error('No se puede eliminar: el código está usado en órdenes activas');
      }

      // Soft delete - just mark as inactive
      await db
        .update(discountCodes)
        .set({ isActive: false })
        .where(eq(discountCodes.id, input.id));

      return { success: true };
    }),

  // Public: Validate discount code for checkout
  validate: publicProcedure
    .input(z.object({
      code: z.string(),
      cartTotal: z.number().nonnegative(),
    }))
    .mutation(async ({ input }) => {
      return await validateDiscountCode(input.code, input.cartTotal);
    }),
});