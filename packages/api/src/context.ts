import { initTRPC, TRPCError } from '@trpc/server';
import { H } from '@hono/node-server';
import { SupabaseClient } from '@supabase/supabase-js';
import { db } from '@ecoomerce-jardineria/db';

export interface Context {
  db: typeof db;
  user: {
    id: string;
    email: string;
    role: 'cliente' | 'admin' | 'mayoreo';
  } | null;
  supabase: SupabaseClient | null;
}

export async function createContext(opts?: H.RequestContext) {
  const authHeader = opts?.env?.req?.headers?.get('authorization');
  
  // TODO: Verify JWT and get user from Supabase
  // For now, return empty context
  const user = null;

  return {
    db,
    user,
    supabase: null,
  };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});
