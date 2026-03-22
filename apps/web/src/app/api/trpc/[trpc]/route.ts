import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

const router = t.router;
const publicProcedure = t.procedure;

// Mock products data for demo (will use real DB in production)
const mockProducts = [
  { id: '1', name: 'Tomate Cherry', slug: 'tomate-cherry', category: 'semilla', price: 35, stock: 100, isOrganic: true, description: 'Tomate cherry de alta producción', images: [], isArchived: false, createdAt: new Date() },
  { id: '2', name: 'Chile Serrano', slug: 'chile-serrano', category: 'semilla', price: 28, stock: 80, isOrganic: true, description: 'Chile serrano típico mexicano', images: [], isArchived: false, createdAt: new Date() },
  { id: '3', name: 'Composta Premium', slug: 'composta-premium', category: 'composta', price: 95, stock: 50, isOrganic: true, description: 'Composta 100% orgánica', images: [], isArchived: false, createdAt: new Date() },
  { id: '4', name: 'Tierra Preparada', slug: 'tierra-preparada', category: 'tierra', price: 120, stock: 40, isOrganic: false, description: 'Tierra fertilizedada lista para usar', images: [], isArchived: false, createdAt: new Date() },
  { id: '5', name: 'Albahaca', slug: 'albahaca', category: 'semilla', price: 22, stock: 120, isOrganic: true, description: 'Albahaca aromática', images: [], isArchived: false, createdAt: new Date() },
  { id: '6', name: 'Humus de Lombriz', slug: 'humus-lombriz', category: 'composta', price: 75, stock: 55, isOrganic: true, description: 'Abono orgánico de alta concentración', images: [], isArchived: false, createdAt: new Date() },
];

const productsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      let filtered = mockProducts;
      
      if (input.category) {
        filtered = filtered.filter(p => p.category === input.category);
      }

      const page = input.page;
      const limit = input.limit;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);

      return {
        products: paginated,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return mockProducts.find(p => p.slug === input.slug) || null;
    }),

  featured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(8) }))
    .query(async ({ input }) => {
      return mockProducts.slice(0, input.limit);
    }),
});

const appRouter = router({
  products: productsRouter,
});

export type AppRouter = typeof appRouter;

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
    onError: ({ error, path }) => {
      console.error(`tRPC error on ${path}:`, error);
    },
  });

export { handler as GET, handler as POST };
