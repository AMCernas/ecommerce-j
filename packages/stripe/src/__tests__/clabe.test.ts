/**
 * CLABE Generation and Validation Tests
 * 
 * Tests for the SPEI CLABE (Clave Bancaria Estandarizada) utility.
 * CLABE is an 18-digit standardized bank reference for Mexican bank transfers.
 * 
 * @see https://github.com/ethereum-payments/eth-payments/wiki/CLABE
 */

import { describe, it, expect } from 'vitest';
import {
  generateCLABE,
  validateCLABE,
  parseCLABE,
  generateCLABEResult,
} from '../utils/clabe';

describe('CLABE Generation', () => {
  describe('generateCLABE', () => {
    it('should generate an 18-digit CLABE', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      const clabe = generateCLABE(orderId);
      
      expect(clabe).toBeDefined();
      expect(clabe).toHaveLength(18);
      expect(/^\d{18}$/.test(clabe)).toBe(true);
    });

    it('should start with STP bank code 646', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      const clabe = generateCLABE(orderId);
      
      // First 3 digits should be STP bank code
      expect(clabe.substring(0, 3)).toBe('646');
    });

    it('should include session number 00 at positions 3-4', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      const clabe = generateCLABE(orderId);
      
      // Digits 3-4 should be session number
      expect(clabe.substring(3, 5)).toBe('00');
    });

    it('should generate unique references for different orders', () => {
      const orderId1 = '550e8400-e29b-41d4-a716-446655440001';
      const orderId2 = '550e8400-e29b-41d4-a716-446655440002';
      
      // Generate CLABEs with a small delay to ensure different timestamps
      const clabe1 = generateCLABE(orderId1);
      const clabe2 = generateCLABE(orderId2);
      
      // References (digits 5-16, 11 digits) should be different
      const ref1 = clabe1.substring(5, 16);
      const ref2 = clabe2.substring(5, 16);
      
      expect(ref1).not.toBe(ref2);
    });

    it('should generate the same reference for the same order at the same timestamp', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      
      // Use the same order ID - the reference calculation uses order ID hash
      const clabe1 = generateCLABE(orderId);
      const clabe2 = generateCLABE(orderId);
      
      // The first 16 digits (bank code + session + reference)
      // should be identical since they're based on the same order ID
      // Note: The final check digit calculation is deterministic
      const ref1 = clabe1.substring(5, 16);
      const ref2 = clabe2.substring(5, 16);
      
      // References should match for same order
      expect(ref1).toBe(ref2);
    });
  });

  describe('CLABE Validation (mod97)', () => {
    it('should validate a correctly generated CLABE', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      const clabe = generateCLABE(orderId);
      
      expect(validateCLABE(clabe)).toBe(true);
    });

    it('should validate CLABE where CLABE % 97 equals 1', () => {
      const orderId = 'test-order-123';
      const clabe = generateCLABE(orderId);
      
      // The mod97 validation should result in CLABE % 97 === 1
      const clabeNum = BigInt(clabe);
      expect(clabeNum % 97n).toBe(1n);
    });

    it('should reject CLABE with wrong check digit', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      const clabe = generateCLABE(orderId);
      
      // Tamper with the check digit
      const tamperedClabe = clabe.substring(0, 16) + '00';
      
      expect(validateCLABE(tamperedClabe)).toBe(false);
    });

    it('should reject CLABE with wrong length', () => {
      expect(validateCLABE('64600000000000000')).toBe(false); // 17 digits
      expect(validateCLABE('6460000000000000000')).toBe(false); // 19 digits
      expect(validateCLABE('646000000000000')).toBe(false); // 15 digits
    });

    it('should reject CLABE with non-numeric characters', () => {
      expect(validateCLABE('64600000000000000a')).toBe(false);
      expect(validateCLABE('64600000000000000!')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateCLABE('')).toBe(false);
    });

    it('should validate known valid CLABE examples', () => {
      // Known valid CLABE calculated with correct algorithm:
      // first16 = 6461801118123456
      // N * 100 % 97 = 28
      // checkDigit = (98 - 28) % 97 = 70
      // CLABE = 646180111812345670
      const knownValid = '646180111812345670';
      expect(validateCLABE(knownValid)).toBe(true);
      
      // Another valid CLABE with zeros
      // first16 = 6460000000000000
      // N * 100 % 97 = 67
      // checkDigit = (98 - 67) % 97 = 31
      // CLABE = 646000000000000031
      expect(validateCLABE('646000000000000031')).toBe(true);
    });
  });

  describe('CLABE Parsing', () => {
    it('should parse a valid CLABE into components', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      const clabe = generateCLABE(orderId);
      
      const parsed = parseCLABE(clabe);
      
      expect(parsed).not.toBeNull();
      expect(parsed?.bankCode).toBe('646');
      expect(parsed?.sessionNumber).toBe('00');
      expect(parsed?.reference).toHaveLength(11);
      expect(parsed?.checkDigits).toHaveLength(2);
    });

    it('should return null for invalid CLABE', () => {
      expect(parseCLABE('invalid')).toBeNull();
      expect(parseCLABE('000000000000000000')).toBeNull();
    });

    it('should extract correct bank code from CLABE', () => {
      const orderId = 'test-order';
      const clabe = generateCLABE(orderId);
      
      const parsed = parseCLABE(clabe);
      expect(parsed?.bankCode).toBe('646'); // STP bank code
    });
  });

  describe('generateCLABEResult', () => {
    it('should return complete CLABE result object', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      const amount = 150000;
      const companyName = 'ECOMMERCE JARDINERIA SA DE CV';
      
      const result = generateCLABEResult(orderId, amount, companyName);
      
      expect(result.clabe).toHaveLength(18);
      expect(result.bank).toBe('STP');
      expect(result.beneficiary).toBe('ECOMMERCE JARDINERIA SA DE CV'); // Should be uppercase
      expect(result.amount).toBe(amount);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.reference).toHaveLength(11);
    });

    it('should uppercase the beneficiary name', () => {
      const result = generateCLABEResult(
        'order-id',
        1000,
        'some company name'
      );
      
      expect(result.beneficiary).toBe('SOME COMPANY NAME');
    });

    it('should set expiry to 72 hours by default', () => {
      const before = Date.now();
      const result = generateCLABEResult('order-id', 1000, 'Company');
      const after = Date.now();
      
      const expectedExpiry = 72 * 60 * 60 * 1000; // 72 hours in ms
      const minExpected = before + expectedExpiry;
      const maxExpected = after + expectedExpiry + 1000; // +1000 for processing time
      
      expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(minExpected);
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(maxExpected);
    });

    it('should respect custom expiry hours', () => {
      const before = Date.now();
      const result = generateCLABEResult('order-id', 1000, 'Company', 24);
      const after = Date.now();
      
      const expectedExpiry = 24 * 60 * 60 * 1000; // 24 hours in ms
      const minExpected = before + expectedExpiry;
      const maxExpected = after + expectedExpiry + 1000;
      
      expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(minExpected);
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(maxExpected);
    });

    it('should generate a valid CLABE in the result', () => {
      const result = generateCLABEResult('order-id', 1000, 'Company');
      
      expect(validateCLABE(result.clabe)).toBe(true);
    });
  });
});
