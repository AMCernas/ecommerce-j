/**
 * Auth Utils Tests
 *
 * Tests for verifyAdminToken function.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { verifyAdminToken } from '../auth';

// Mock jose library
vi.mock('jose', async () => {
  const actual = await vi.importActual('jose');
  return {
    ...actual,
    jwtVerify: vi.fn(),
    createRemoteJWKSet: vi.fn(),
  };
});

import { jwtVerify, createRemoteJWKSet } from 'jose';

const mockJwtVerify = jwtVerify as ReturnType<typeof vi.fn>;
const mockCreateRemoteJWKSet = createRemoteJWKSet as ReturnType<typeof vi.fn>;

describe('verifyAdminToken', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return payload for valid admin JWT', async () => {
    const mockPayload = {
      sub: 'user-123',
      email: 'admin@jardinverde.mx',
      role: 'admin',
    };

    mockJwtVerify.mockResolvedValue({ payload: mockPayload });
    mockCreateRemoteJWKSet.mockReturnValue('mock-jwks');

    const result = await verifyAdminToken('valid-jwt-token', 'https://example.supabase.co');

    expect(result).toEqual(mockPayload);
    expect(mockCreateRemoteJWKSet).toHaveBeenCalledWith(
      new URL('https://example.supabase.co/auth/v1/jwks')
    );
    expect(mockJwtVerify).toHaveBeenCalledWith('valid-jwt-token', 'mock-jwks', {
      issuer: 'https://example.supabase.co/auth/v1',
      audience: 'authenticated',
    });
  });

  it('should return null for invalid JWT', async () => {
    mockJwtVerify.mockRejectedValue(new Error('Invalid token'));

    const result = await verifyAdminToken('invalid-jwt', 'https://example.supabase.co');

    expect(result).toBeNull();
  });

  it('should return null for expired JWT', async () => {
    mockJwtVerify.mockRejectedValue(new Error('Token has expired'));

    const result = await verifyAdminToken('expired-jwt', 'https://example.supabase.co');

    expect(result).toBeNull();
  });

  it('should return null when token verification fails with any error', async () => {
    mockJwtVerify.mockRejectedValue(new Error('Some other error'));

    const result = await verifyAdminToken('bad-jwt', 'https://example.supabase.co');

    expect(result).toBeNull();
  });

  it('should use correct JWKS URL format', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: 'user-1', email: 'admin@test.com' },
    });
    mockCreateRemoteJWKSet.mockReturnValue('mock-jwks');

    await verifyAdminToken('token', 'https://supabase.co');

    expect(mockCreateRemoteJWKSet).toHaveBeenCalledWith(
      new URL('https://supabase.co/auth/v1/jwks')
    );
  });
});