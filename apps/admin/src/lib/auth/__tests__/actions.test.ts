/**
 * Auth Actions Tests
 *
 * Tests for signInWithEmail and signOut server actions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockSignInWithPassword, mockSignOut, mockSupabaseClient } = vi.hoisted(() => {
  const mockSignInWithPassword = vi.fn();
  const mockSignOut = vi.fn();
  
  // Create a chainable mock for database queries
  const createQueryChain = (returnValue: any) => {
    return {
      single: vi.fn().mockResolvedValue(returnValue),
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue(returnValue),
      })),
    };
  };
  
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => createQueryChain({ data: { role: 'admin' }, error: null })),
  }));
  
  const mockSupabaseClient = {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
    from: mockFrom,
  };
  
  return { mockSignInWithPassword, mockSignOut, mockSupabaseClient, mockFrom };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('REDIRECT');
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { signInWithEmail, signOut } from '../actions';
import { revalidatePath } from 'next/cache';

describe('auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('signInWithEmail', () => {
    it('should call signInWithPassword with correct credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'admin@test.com' } },
        error: null,
      });

      const formData = new FormData();
      formData.set('email', 'admin@test.com');
      formData.set('password', 'password123');

      try {
        await signInWithEmail(null, formData);
      } catch {
        // Ignore redirect error
      }

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'password123',
      });
    });

    it('should return error for invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      const formData = new FormData();
      formData.set('email', 'wrong@test.com');
      formData.set('password', 'wrongpassword');

      const result = await signInWithEmail(null, formData);

      expect(result).toEqual({
        success: false,
        error: 'Credenciales inválidas',
      });
    });

    it('should return error for missing email or password', async () => {
      const formData = new FormData();
      formData.set('email', '');

      const result = await signInWithEmail(null, formData);

      expect(result).toEqual({
        success: false,
        error: 'Email y contraseña son requeridos',
      });
    });

    it('should return error for non-admin user after successful login', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'cliente@test.com' } },
        error: null,
      });

      mockSignOut.mockResolvedValue({ error: null });

      // Simulate returning 'cliente' role
      mockSupabaseClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { role: 'cliente' }, error: null }),
          })),
          single: vi.fn().mockResolvedValue({ data: { role: 'cliente' }, error: null }),
        })),
      }));

      const formData = new FormData();
      formData.set('email', 'cliente@test.com');
      formData.set('password', 'password123');

      const result = await signInWithEmail(null, formData);

      expect(result).toEqual({
        success: false,
        error: 'No tienes permisos de administrador',
      });
    });

    it('should return error when user has no role in database', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'admin@test.com' } },
        error: null,
      });

      // Simulate no role in database (data: null)
      mockSupabaseClient.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      }));

      const formData = new FormData();
      formData.set('email', 'admin@test.com');
      formData.set('password', 'password123');

      const result = await signInWithEmail(null, formData);

      expect(result).toEqual({
        success: false,
        error: 'No tienes permisos de administrador',
      });
    });
  });

  describe('signOut', () => {
    it('should call signOut and revalidate path', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      try {
        await signOut();
      } catch {
        // Ignore redirect error
      }

      expect(mockSignOut).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    });
  });
});