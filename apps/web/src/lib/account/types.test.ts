import { describe, it, expect } from 'vitest';
import { profileSchema, addressSchema } from './types';

describe('profileSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid name and phone', () => {
      const result = profileSchema.safeParse({
        name: 'Juan Pérez',
        phone: '1234567890',
      });
      expect(result.success).toBe(true);
    });

    it('should accept name only', () => {
      const result = profileSchema.safeParse({
        name: 'Juan Pérez',
      });
      expect(result.success).toBe(true);
    });

    it('should accept phone only', () => {
      const result = profileSchema.safeParse({
        phone: '1234567890',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = profileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept exactly 10 digits', () => {
      const result = profileSchema.safeParse({
        phone: '1234567890',
      });
      expect(result.success).toBe(true);
    });

    it('should accept name with 3 characters', () => {
      const result = profileSchema.safeParse({
        name: 'Ana',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject name with less than 3 characters', () => {
      const result = profileSchema.safeParse({
        name: 'Jo',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('3 caracteres');
      }
    });

    it('should reject phone with less than 10 digits', () => {
      const result = profileSchema.safeParse({
        phone: '123456789',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('10 dígitos');
      }
    });

    it('should reject phone with more than 10 digits', () => {
      const result = profileSchema.safeParse({
        phone: '12345678901',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('10 dígitos');
      }
    });

    it('should reject phone with non-digit characters', () => {
      const result = profileSchema.safeParse({
        phone: '123456789a',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Solo números');
      }
    });
  });
});

describe('addressSchema', () => {
  const validAddress = {
    name: 'Casa Principal',
    street: 'Av. Principal',
    exteriorNumber: '123',
    neighborhood: 'Colonia Centro',
    city: 'Ciudad de México',
    state: 'CDMX',
    postalCode: '12345',
    phone: '1234567890',
  };

  describe('valid inputs', () => {
    it('should accept valid address with all required fields', () => {
      const result = addressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should accept address with interior number', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        interiorNumber: '4B',
      });
      expect(result.success).toBe(true);
    });

    it('should accept address with isDefault true', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        isDefault: true,
      });
      expect(result.success).toBe(true);
    });

    it('should accept address with isDefault false', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        isDefault: false,
      });
      expect(result.success).toBe(true);
    });

    it('should accept 5-digit postal code', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        postalCode: '12345',
      });
      expect(result.success).toBe(true);
    });

    it('should accept name with exactly 3 characters', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        name: 'Ana',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject missing name', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        name: undefined,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod returns "Required" for missing required fields
        expect(result.error.issues[0].message).toBe('Required');
      }
    });

    it('should reject name with less than 3 characters', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        name: 'AB',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('3 caracteres');
      }
    });

    it('should reject missing street', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        street: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('calle');
      }
    });

    it('should reject missing exterior number', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        exteriorNumber: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('número exterior');
      }
    });

    it('should reject missing neighborhood', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        neighborhood: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('colonia');
      }
    });

    it('should reject missing city', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        city: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ciudad');
      }
    });

    it('should reject missing state', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        state: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('estado');
      }
    });

    it('should reject missing postal code', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        postalCode: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('código postal');
      }
    });

    it('should reject postal code with less than 5 digits', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        postalCode: '1234',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('5 dígitos');
      }
    });

    it('should reject postal code with more than 5 digits', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        postalCode: '123456',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('5 dígitos');
      }
    });

    it('should reject postal code with non-digit characters', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        postalCode: '1234A',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Solo números');
      }
    });

    it('should reject phone with less than 10 digits', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        phone: '123456789',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('10 dígitos');
      }
    });

    it('should reject phone with non-digit characters', () => {
      const result = addressSchema.safeParse({
        ...validAddress,
        phone: '123456789a',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Solo números');
      }
    });
  });
});
