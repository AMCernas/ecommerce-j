// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'cliente' | 'admin' | 'mayoreo';
  climateZone: string | null;
  emailConfirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Profile update
export interface ProfileUpdate {
  name?: string;
  phone?: string;
  climateZone?: string;
}
