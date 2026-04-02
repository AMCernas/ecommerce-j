import { initTRPC, TRPCError } from '@trpc/server';
import { H } from '@hono/node-server';
import { SupabaseClient } from '@supabase/supabase-js';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { db } from '@ecoomerce-jardineria/db';
import { users } from '@ecoomerce-jardineria/db';
import { eq } from 'drizzle-orm';

export interface Context {
  db: typeof db;
  user: {
    id: string;
    email: string;
    role: 'cliente' | 'admin' | 'mayoreo';
  } | null;
  supabase: SupabaseClient | null;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function createContext(opts?: H.RequestContext) {
  const authHeader = opts?.env?.req?.headers?.get('authorization');
  let user: Context['user'] = null;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace('Bearer ', '');
      
      // Verify JWT using Supabase JWKS
      const JWKS = createRemoteJWKSet(
        new URL(`${SUPABASE_URL}/auth/v1/jwks`)
      );

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: `${SUPABASE_URL}/auth/v1`,
        audience: 'authenticated',
      });

      // Get user from database with role
      const userId = payload.sub as string;
      
      if (userId) {
        const [dbUser] = await db
          .select({
            id: users.id,
            email: users.email,
            role: users.role,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role as 'cliente' | 'admin' | 'mayoreo',
          };
        }
      }
    } catch (err) {
      // Invalid token - user remains null
      console.error('JWT verification failed:', err);
    }
  }

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
