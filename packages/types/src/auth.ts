// Admin authentication types

export type AuthResult = 
  | { success: true; user: { id: string; email: string } }
  | { success: false; error: string };

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}
