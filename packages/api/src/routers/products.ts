import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../context';
import { eq, like, and, or, sql, desc, asc } from 'drizzle-orm';
import { products, categories } from '@ecoomerce-jardineria/db';

// Product filters schema
const productFiltersSchema = z.object({
  category: z.enum(['semilla', 'tierra', 'composta', 'accesorio']).optional(),
  subcategory: z.enum(['hortaliza', 'flor', 'árbol', 'hierba', 'ornamental']).optional(),
  isOrganic: z.boolean().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  search: z.string().optional(),
  climateZone: z.string().optional(),
  sowMonth: z.number().min(1).max(12).optional(),
  waterNeeds: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  sunNeeds: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  careLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  spaceNeeded: z.enum(['maceta_pequeña', 'maceta_grande', 'jardín', 'campo']).optional(),
});

export const productsRouter = router({
  // List products with filters
  list: publicProcedure
    .input(
      z.object({
        filters: productFiltersSchema.optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        sortBy: z.enum(['name', 'price', 'createdAt']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { filters, page, limit, sortBy, sortOrder } = input;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [sql`${products.isArchived} = false`];

      if (filters?.category) {
        conditions.push(eq(products.category, filters.category));
      }

      if (filters?.subcategory) {
        conditions.push(eq(products.subcategory, filters.subcategory));
      }

      if (filters?.isOrganic !== undefined) {
        conditions.push(eq(products.isOrganic, filters.isOrganic));
      }

      if (filters?.minPrice !== undefined) {
        conditions.push(sql`${products.price} >= ${filters.minPrice}`);
      }

      if (filters?.maxPrice !== undefined) {
        conditions.push(sql`${products.price} <= ${filters.maxPrice}`);
      }

      if (filters?.search) {
        conditions.push(
          or(
            like(products.name, `%${filters.search}%`),
            like(products.description, `%${filters.search}%`)
          )!
        );
      }

      // Get total count
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(and(...conditions));

      const total = countResult?.count || 0;

      // Get products
      const orderColumn = sortBy === 'name' 
        ? products.name 
        : sortBy === 'price' 
          ? products.price 
          : products.createdAt;
      const orderDirection = sortOrder === 'asc' ? asc : desc;

      const productList = await ctx.db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(orderDirection(orderColumn))
        .limit(limit)
        .offset(offset);

      return {
        products: productList,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get product by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [product] = await ctx.db
        .select()
        .from(products)
        .where(eq(products.slug, input.slug))
        .limit(1);
      
      if (!product) {
        return null;
      }
      
      return product;
    }),

  // Get product by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [product] = await ctx.db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);
      
      return product || null;
    }),

  // List categories
  listCategories: publicProcedure.query(async ({ ctx }) => {
    const categoryList = await ctx.db
      .select()
      .from(categories)
      .orderBy(categories.name);
    
    return categoryList;
  }),

  // Get featured products (for homepage)
  featured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(8) }))
    .query(async ({ ctx, input }) => {
      const productList = await ctx.db
        .select()
        .from(products)
        .where(and(
          sql`${products.isArchived} = false`,
          sql`${products.stock} > 0`
        ))
        .orderBy(desc(products.createdAt))
        .limit(input.limit);
      
      return productList;
    }),

  // Admin: Create product
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        category: z.enum(['semilla', 'tierra', 'composta', 'accesorio']),
        subcategory: z.enum(['hortaliza', 'flor', 'árbol', 'hierba', 'ornamental']).optional(),
        description: z.string(),
        isOrganic: z.boolean().default(false),
        climateZones: z.array(z.string()).optional(),
        sowMonths: z.array(z.number().min(1).max(12)).optional(),
        harvestMonths: z.array(z.number().min(1).max(12)).optional(),
        waterNeeds: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
        sunNeeds: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
        careLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
        spaceNeeded: z.enum(['maceta_pequeña', 'maceta_grande', 'jardín', 'campo']).optional(),
        germinationRate: z.number().min(0).max(100).optional(),
        daysToGerminate: z.number().positive().optional(),
        daysToHarvest: z.number().positive().optional(),
        weightOptions: z.array(z.object({
          g: z.number(),
          price: z.number(),
          stock: z.number(),
        })).optional(),
        images: z.array(z.string()).optional(),
        price: z.number().positive(),
        stock: z.number().int().nonnegative().default(0),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [product] = await ctx.db
        .insert(products)
        .values(input)
        .returning();
      
      return product;
    }),

  // Admin: Update product
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().min(1).max(255).optional(),
          slug: z.string().min(1).max(255).optional(),
          category: z.enum(['semilla', 'tierra', 'composta', 'accesorio']).optional(),
          subcategory: z.enum(['hortaliza', 'flor', 'árbol', 'hierba', 'ornamental']).optional(),
          description: z.string().optional(),
          isOrganic: z.boolean().optional(),
          climateZones: z.array(z.string()).optional(),
          sowMonths: z.array(z.number().min(1).max(12)).optional(),
          harvestMonths: z.array(z.number().min(1).max(12)).optional(),
          waterNeeds: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
          sunNeeds: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
          careLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
          spaceNeeded: z.enum(['maceta_pequeña', 'maceta_grande', 'jardín', 'campo']).optional(),
          germinationRate: z.number().min(0).max(100).optional(),
          daysToGerminate: z.number().positive().optional(),
          daysToHarvest: z.number().positive().optional(),
          weightOptions: z.array(z.object({
            g: z.number(),
            price: z.number(),
            stock: z.number(),
          })).optional(),
          images: z.array(z.string()).optional(),
          price: z.number().positive().optional(),
          stock: z.number().int().nonnegative().optional(),
          seoTitle: z.string().optional(),
          seoDescription: z.string().optional(),
          isArchived: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [product] = await ctx.db
        .update(products)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.id))
        .returning();
      
      return product;
    }),

  // Admin: Archive product
  archive: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [product] = await ctx.db
        .update(products)
        .set({ isArchived: true, updatedAt: new Date() })
        .where(eq(products.id, input.id))
        .returning();
      
      return product;
    }),
});
