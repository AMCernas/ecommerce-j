/**
 * Discount Validation Tests
 *
 * Tests for calculateDiscount function (pure function).
 * For validateDiscountCode, see integration tests.
 */

import { describe, it, expect } from 'vitest';
import { calculateDiscount, type DiscountType } from '../discount-validation';

describe('calculateDiscount', () => {
  it('should calculate percentage discount correctly - 10%', () => {
    const discount = {
      type: 'percentage' as DiscountType,
      value: '10',
    };
    
    const result = calculateDiscount(discount, 1000);
    
    expect(result).toBe(100); // 10% of 1000
  });

  it('should calculate percentage discount correctly - 50%', () => {
    const discount = {
      type: 'percentage' as DiscountType,
      value: '50',
    };
    
    const result = calculateDiscount(discount, 1000);
    
    expect(result).toBe(500); // 50% of 1000
  });

  it('should calculate percentage discount correctly - 100%', () => {
    const discount = {
      type: 'percentage' as DiscountType,
      value: '100',
    };
    
    const result = calculateDiscount(discount, 500);
    
    expect(result).toBe(500); // 100% of 500 = full price
  });

  it('should calculate fixed_mxn discount correctly', () => {
    const discount = {
      type: 'fixed_mxn' as DiscountType,
      value: '50',
    };
    
    const result = calculateDiscount(discount, 1000);
    
    expect(result).toBe(50);
  });

  it('should calculate fixed_mxn discount correctly - $200', () => {
    const discount = {
      type: 'fixed_mxn' as DiscountType,
      value: '200',
    };
    
    const result = calculateDiscount(discount, 800);
    
    expect(result).toBe(200);
  });

  it('should cap fixed_mxn discount at subtotal when value exceeds subtotal', () => {
    const discount = {
      type: 'fixed_mxn' as DiscountType,
      value: '500',
    };
    
    const result = calculateDiscount(discount, 300);
    
    expect(result).toBe(300); // capped at subtotal
  });

  it('should handle zero value', () => {
    const discount = {
      type: 'percentage' as DiscountType,
      value: '0',
    };
    
    const result = calculateDiscount(discount, 1000);
    
    expect(result).toBe(0);
  });

  it('should handle small percentage values', () => {
    const discount = {
      type: 'percentage' as DiscountType,
      value: '5',
    };
    
    const result = calculateDiscount(discount, 1000);
    
    expect(result).toBe(50); // 5% of 1000
  });
});