import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../context';
import { db } from '@ecoomerce-jardineria/db';
import { orders, orderItems } from '@ecoomerce-jardineria/db';
import { eq, and, desc, like, gte, lte, or, sql } from 'drizzle-orm';
import { isValidStatusTransition } from '../utils/order-status';

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'refunded', 'failed', 'cancelled'] as const;

export const ordersRouter = router({
  // Get user's orders
  list: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        status: z.enum(ORDER_STATUSES).optional(),
        search: z.string().optional(),
        dateRange: z.object({
          start: z.string().datetime(),
          end: z.string().datetime(),
        }).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 10;
      const offset = (page - 1) * limit;

      const conditions = [];

      if (input?.status) {
        conditions.push(eq(orders.status, input.status));
      }

      if (input?.search) {
        const searchPattern = `%${input.search}%`;
        conditions.push(
          or(
            like(orders.id, searchPattern),
            like(orders.customerEmail, searchPattern),
            like(orders.customerName, searchPattern)
          )
        );
      }

      if (input?.dateRange) {
        conditions.push(gte(orders.createdAt, new Date(input.dateRange.start)));
        conditions.push(lte(orders.createdAt, new Date(input.dateRange.end)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereClause);

      const total = Number(countResult?.count ?? 0);
      const totalPages = Math.ceil(total / limit);

      const orderList = await db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        orders: orderList,
        total,
        page,
        limit,
        totalPages,
      };
    }),

  // Get order by ID (admin - full details)
  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, input.id),
      });

      if (!order) {
        return null;
      }

      const items = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, input.id),
      });

      return {
        ...order,
        items,
      };
    }),

  // Get order by ID (public with order number)
  getByOrderNumber: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      // TODO: Implement actual query
      return null;
    }),

  // Create order (checkout)
  create: publicProcedure
    .input(
      z.object({
        items: z.array(z.object({
          productId: z.string().uuid(),
          variantG: z.number(),
          quantity: z.number().min(1),
        })),
        shippingAddress: z.object({
          name: z.string(),
          street: z.string(),
          exteriorNumber: z.string(),
          interiorNumber: z.string().optional(),
          neighborhood: z.string(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          phone: z.string(),
        }),
        paymentMethod: z.enum(['oxxo', 'spei', 'card']),
        discountCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement actual order creation with stock validation
      // and Stripe payment intent creation
      return {
        orderId: 'temp-id',
        clientSecret: null,
        oxxoVoucherUrl: null,
        speiCLABE: null,
      };
    }),

  // Cancel order
  cancel: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement cancellation with refund if applicable
      return { success: true };
    }),

  // Admin: Update order status
  updateStatus: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(ORDER_STATUSES),
    }))
    .mutation(async ({ ctx, input }) => {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order) {
        throw new Error('Order not found');
      }

      const currentStatus = order.status as string;
      if (!isValidStatusTransition(currentStatus, input.status)) {
        throw new Error(`Invalid status transition: ${currentStatus} -> ${input.status}`);
      }

      await db.update(orders)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.id));

      return { success: true };
    }),

  // Admin: Update tracking number
  updateTracking: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      trackingNumber: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order) {
        throw new Error('Order not found');
      }

      await db.update(orders)
        .set({
          trackingNumber: input.trackingNumber,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.id));

      // TODO: Trigger email notification about tracking update

      return { success: true };
    }),

  // Admin: Update internal notes
  updateNotes: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      notes: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order) {
        throw new Error('Order not found');
      }

      await db.update(orders)
        .set({
          notes: input.notes,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.id));

      return { success: true };
    }),
});
