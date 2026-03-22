import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../context';
import { TRPCError } from '@trpc/server';

export const authRouter = router({
  // Register
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(10),
        name: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement with Supabase Auth
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Registration not implemented yet',
      });
    }),

  // Login
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement with Supabase Auth
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Login not implemented yet',
      });
    }),

  // Magic link
  magicLink: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement with Supabase Auth
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Magic link not implemented yet',
      });
    }),

  // Get current session
  getSession: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  // Update profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        climateZone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement profile update
      return { success: true };
    }),

  // Delete account
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    // TODO: Implement account deletion (LFPDPPP compliance)
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'Account deletion not implemented yet',
    });
  }),
});
