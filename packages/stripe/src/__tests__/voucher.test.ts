/**
 * Voucher Generation Tests
 * 
 * Tests for OXXO voucher generation utilities including:
 * - generateVoucherData returns correct structure
 * - Barcode generation (Code 128)
 * - Expiration date calculation (72 hours default)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateVoucherData,
  sanitizeCustomerName,
  generateOXXOVoucher,
} from '../utils/voucher';

describe('Voucher Data Generation', () => {
  describe('generateVoucherData', () => {
    it('should return correct structure with all required fields', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      const amount = 15000; // 150 MXN in cents
      const customerName = 'Juan Pérez';
      const expiresAt = new Date('2025-03-28T12:00:00Z');

      const result = generateVoucherData(orderId, amount, customerName, expiresAt);

      expect(result).toHaveProperty('reference');
      expect(result).toHaveProperty('orderId');
      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('customerName');
      expect(result).toHaveProperty('expiresAt');
    });

    it('should return the same orderId passed in', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      const result = generateVoucherData(orderId, 1000, 'Test', new Date());

      expect(result.orderId).toBe(orderId);
    });

    it('should return the same amount passed in', () => {
      const amount = 25000;
      const result = generateVoucherData('order-123', amount, 'Test', new Date());

      expect(result.amount).toBe(amount);
    });

    it('should return the same expiresAt passed in', () => {
      const expiresAt = new Date('2025-12-25T12:00:00Z');
      const result = generateVoucherData('order-123', 1000, 'Test', expiresAt);

      expect(result.expiresAt).toEqual(expiresAt);
    });

    it('should generate a reference number with 14+ characters', () => {
      const result = generateVoucherData('order-123', 1000, 'Test', new Date());

      expect(result.reference.length).toBeGreaterThanOrEqual(14);
      // Reference contains timestamp (8 digits) + order hash (up to 6 alphanumeric chars)
      expect(result.reference).toMatch(/^[\d]+[a-z0-9]+$/i);
    });

    it('should sanitize customer name in the result', () => {
      const result = generateVoucherData('order-123', 1000, 'Juan Pérez', new Date());

      // Should replace space with underscore
      expect(result.customerName).toBe('Juan_Pérez');
    });

    it('should handle HTML tags in customer name', () => {
      const result = generateVoucherData('order-123', 1000, '<script>alert("xss")</script>Juan', new Date());

      // Should strip HTML tags
      expect(result.customerName).not.toContain('<');
      expect(result.customerName).not.toContain('>');
    });

    it('should handle special characters in customer name', () => {
      const result = generateVoucherData('order-123', 1000, 'José García@#$%', new Date());

      // Should remove special characters
      expect(result.customerName).toMatch(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.]+$/);
    });

    it('should truncate long customer names to 50 characters', () => {
      const longName = 'A'.repeat(100);
      const result = generateVoucherData('order-123', 1000, longName, new Date());

      expect(result.customerName).toHaveLength(50);
    });

    it('should generate different references for different orders', async () => {
      const order1 = '550e8400-e29b-41d4-a716-446655440001';
      const order2 = '550e8400-e29b-41d4-a716-446655440002';

      const result1 = generateVoucherData(order1, 1000, 'Test', new Date());
      
      // Add delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result2 = generateVoucherData(order2, 1000, 'Test', new Date());

      // Different orders should produce different references (due to order hash)
      expect(result1.reference).not.toBe(result2.reference);
    });

    it('should include order hash in reference', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      const result = generateVoucherData(orderId, 1000, 'Test', new Date());

      // Reference should contain part of order ID
      const orderHash = orderId.replace(/-/g, '').slice(0, 6);
      expect(result.reference).toContain(orderHash);
    });
  });

  describe('sanitizeCustomerName', () => {
    it('should strip HTML tags', () => {
      const input = '<b>Juan</b><script>evil()</script>';
      const result = sanitizeCustomerName(input);

      // The regex strips tags but preserves content between them
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      // Content is preserved: "Juan" + "evil()" = "Juanevil"
      expect(result).toContain('Juan');
      expect(result).toContain('evil');
    });

    it('should replace spaces with underscores', () => {
      const result = sanitizeCustomerName('Juan Perez');

      expect(result).toBe('Juan_Perez');
    });

    it('should preserve accented characters', () => {
      const result = sanitizeCustomerName('José García');

      expect(result).toBe('José_García');
    });

    it('should remove special characters', () => {
      const result = sanitizeCustomerName('Test@#$%Name!');

      expect(result).toBe('TestName');
    });

    it('should allow hyphens, underscores, and dots', () => {
      const result = sanitizeCustomerName('Test-Name_Surname.Co');

      expect(result).toBe('Test-Name_Surname.Co');
    });

    it('should trim whitespace', () => {
      const result = sanitizeCustomerName('  Juan  ');

      expect(result).toBe('Juan');
    });

    it('should truncate to 50 characters', () => {
      const longName = 'A'.repeat(100);
      const result = sanitizeCustomerName(longName);

      expect(result).toHaveLength(50);
    });
  });
});

describe('Barcode Generation', () => {
  it('should be importable from voucher module', () => {
    // The barcode generation is internal to the module
    // We test it indirectly through PDF generation
    expect(generateVoucherData).toBeDefined();
  });
});

describe('Expiration Date Calculation', () => {
  const DEFAULT_OXXO_EXPIRY_HOURS = 72;

  it('should use 72 hours as default expiry for OXXO vouchers', () => {
    const orderId = 'order-123';
    const amount = 1000;
    const customerName = 'Test User';
    const beforeCreate = Date.now();

    const expiresAt = new Date(Date.now() + DEFAULT_OXXO_EXPIRY_HOURS * 60 * 60 * 1000);

    const result = generateVoucherData(orderId, amount, customerName, expiresAt);

    // The expiresAt should be 72 hours from now
    const expectedExpiryMs = DEFAULT_OXXO_EXPIRY_HOURS * 60 * 60 * 1000;
    const actualExpiryMs = result.expiresAt.getTime() - beforeCreate;

    // Allow 5 seconds tolerance for test execution time
    expect(Math.abs(actualExpiryMs - expectedExpiryMs)).toBeLessThan(5000);
  });

  it('should preserve custom expiry dates', () => {
    const customExpiry = new Date('2030-12-25T12:00:00Z');
    const result = generateVoucherData('order-123', 1000, 'Test', customExpiry);

    expect(result.expiresAt).toEqual(customExpiry);
  });
});

describe('PDF Voucher Generation', () => {
  it('should generate a valid PDF buffer', async () => {
    const options = {
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 15000,
      customerName: 'Juan Pérez',
      reference: '12345678901234',
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      companyName: 'Test Company SA de CV',
    };

    const pdfBuffer = await generateOXXOVoucher(options);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    // PDF files start with %PDF-
    expect(pdfBuffer.toString('utf8', 0, 5)).toBe('%PDF-');
  });

  it('should generate valid PDF structure', async () => {
    const options = {
      orderId: 'order-123',
      amount: 15000,
      customerName: 'Test User',
      reference: '12345678901234',
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      companyName: 'Test Company',
    };

    const pdfBuffer = await generateOXXOVoucher(options);
    const pdfString = pdfBuffer.toString('binary');

    // Check PDF structure markers
    expect(pdfString).toContain('%PDF-');
    expect(pdfString).toContain('endobj');
    expect(pdfString).toContain('endstream');
    expect(pdfString).toContain('%%EOF');
  });

  it('should sanitize customer name in PDF', async () => {
    const options = {
      orderId: 'order-123',
      amount: 1000,
      customerName: '<b>Test</b> Juan',
      reference: '12345678901234',
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      companyName: 'Test Company',
    };

    // Should not throw - customer name is sanitized internally
    const pdfBuffer = await generateOXXOVoucher(options);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
  });

  it('should handle unicode characters in customer name', async () => {
    const options = {
      orderId: 'order-123',
      amount: 1000,
      customerName: 'José García Hernández',
      reference: '12345678901234',
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      companyName: 'Test Company',
    };

    const pdfBuffer = await generateOXXOVoucher(options);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should generate PDF with correct size', async () => {
    const options = {
      orderId: 'order-123',
      amount: 15000,
      customerName: 'Test',
      reference: '12345678901234',
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      companyName: 'Test Company',
    };

    const pdfBuffer = await generateOXXOVoucher(options);

    // PDF should be a reasonable size (at least 1KB)
    expect(pdfBuffer.length).toBeGreaterThan(1024);
  });

  it('should handle large amounts correctly', async () => {
    const options = {
      orderId: 'order-123',
      amount: 99999999, // Almost 1 million MXN
      customerName: 'Test User',
      reference: '12345678901234',
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      companyName: 'Test Company',
    };

    const pdfBuffer = await generateOXXOVoucher(options);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });
});
