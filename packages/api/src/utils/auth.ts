import { jwtVerify, createRemoteJWKSet, type JWTPayload } from 'jose';

interface AdminUser extends JWTPayload {
  sub: string;
  email: string;
}

/**
 * Verify and decode an admin JWT token using Supabase's JWKS
 */
export async function verifyAdminToken(
  token: string,
  supabaseUrl: string
): Promise<AdminUser | null> {
  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/jwks`)
    );

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${supabaseUrl}/auth/v1`,
      audience: 'authenticated',
    });

    return payload as AdminUser;
  } catch (err) {
    console.error('Token verification failed:', err);
    return null;
  }
}
