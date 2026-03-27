/**
 * XSS Sanitization Tests
 * 
 * Tests for input sanitization to prevent XSS attacks.
 * Customer names are sanitized before being printed on OXXO vouchers.
 */

import { describe, it, expect } from 'vitest';
import { sanitizeCustomerName } from '../utils/voucher';

describe('XSS Sanitization', () => {
  describe('sanitizeCustomerName', () => {
    describe('Script Tag Stripping', () => {
      it('should strip basic script tags', () => {
        const input = '<script>alert("xss")</script>Juan Pérez';
        const result = sanitizeCustomerName(input);
        
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('</script>');
        expect(result).toContain('Juan');
        expect(result).toContain('Pérez');
      });

      it('should strip script tags with attributes', () => {
        const input = '<script src="evil.js"></script>Maria Lopez';
        const result = sanitizeCustomerName(input);
        
        expect(result).not.toContain('<script');
        expect(result).not.toContain('src=');
        expect(result).not.toContain('evil.js');
        expect(result).toContain('Maria');
        expect(result).toContain('Lopez');
      });

      it('should strip inline script handlers', () => {
        const input = '<img src=x onerror="alert(1)">John Doe';
        const result = sanitizeCustomerName(input);
        
        expect(result).not.toContain('<img');
        expect(result).not.toContain('onerror');
        expect(result).toContain('John');
        expect(result).toContain('Doe');
      });

      it('should strip javascript: URLs', () => {
        const input = '<a href="javascript:alert(1)">Click me</a>Pedro';
        const result = sanitizeCustomerName(input);
        
        expect(result).not.toContain('javascript:');
        expect(result).not.toContain('href=');
        expect(result).toContain('Click');
        expect(result).toContain('Pedro');
      });

      it('should strip SVG tags with script content', () => {
        const input = '<svg onload="alert(1)">Carlos</svg>';
        const result = sanitizeCustomerName(input);
        
        expect(result).not.toContain('<svg');
        expect(result).not.toContain('onload');
        expect(result).toContain('Carlos');
      });

      it('should strip iframe embed tags', () => {
        const input = '<iframe src="evil.com"></iframe>Ana';
        const result = sanitizeCustomerName(input);
        
        expect(result).not.toContain('<iframe');
        expect(result).not.toContain('src=');
        expect(result).toContain('Ana');
      });

      it('should strip object and embed tags', () => {
        const input = '<object data="evil.swf"></object>Luis';
        const result = sanitizeCustomerName(input);
        
        expect(result).not.toContain('<object');
        expect(result).not.toContain('data=');
        expect(result).toContain('Luis');
      });

      it('should strip style tags', () => {
        const input = '<style>@import "evil.css"</style>Elena';
        const result = sanitizeCustomerName(input);
        
        expect(result).not.toContain('<style');
        expect(result).not.toContain('@import');
        expect(result).toContain('Elena');
      });

      it('should strip on* event handlers from any element', () => {
        const input = '<div onmouseover="alert(1)">Sofia</div>';
        const result = sanitizeCustomerName(input);
        
        expect(result).not.toContain('onmouseover');
        expect(result).not.toContain('onclick');
        expect(result).not.toContain('onload');
        expect(result).toContain('Sofia');
      });
    });

    describe('Valid Names Pass Through', () => {
      it('should allow simple names', () => {
        expect(sanitizeCustomerName('Juan Pérez')).toBe('Juan_Pérez');
      });

      it('should allow names with accents', () => {
        expect(sanitizeCustomerName('María González')).toBe('María_González');
      });

      it('should allow ñ character', () => {
        expect(sanitizeCustomerName('España')).toBe('España');
      });

      it('should allow hyphens and underscores', () => {
        expect(sanitizeCustomerName('Mary-Jane O_Connor')).toBe('Mary-Jane_O_Connor');
      });

      it('should allow periods', () => {
        expect(sanitizeCustomerName('Dr. Juan Pérez Jr.')).toBe('Dr._Juan_Pérez_Jr.');
      });

      it('should trim whitespace', () => {
        expect(sanitizeCustomerName('  Juan  ')).toBe('Juan');
        expect(sanitizeCustomerName('\tMaria\n')).toBe('Maria');
      });

      it('should replace multiple spaces with single underscore', () => {
        expect(sanitizeCustomerName('Juan    Pérez')).toBe('Juan_Pérez');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string', () => {
        expect(sanitizeCustomerName('')).toBe('');
      });

      it('should handle string with only special characters', () => {
        expect(sanitizeCustomerName('!@#$%^&*()')).toBe('');
      });

      it('should handle only HTML tags', () => {
        expect(sanitizeCustomerName('<script></script>')).toBe('');
      });

      it('should handle nested tags', () => {
        const input = '<div><span><script>evil()</script></span></div>Pedro';
        const result = sanitizeCustomerName(input);
        
        expect(result).not.toContain('<div>');
        expect(result).not.toContain('<span>');
        expect(result).not.toContain('<script>');
        expect(result).toContain('Pedro');
      });

      it('should handle malformed HTML', () => {
        const input = '<script>alert(1)</script<div>Pedro</div>';
        const result = sanitizeCustomerName(input);
        
        expect(result).not.toContain('<script>');
        expect(result).toContain('Pedro');
      });

      it('should limit length to 50 characters', () => {
        const longName = 'A'.repeat(60);
        const result = sanitizeCustomerName(longName);
        
        expect(result).toHaveLength(50);
      });
    });

    describe('Special Character Handling', () => {
      it('should remove angle brackets', () => {
        expect(sanitizeCustomerName('J<u>an</u>')).toBe('Jan');
      });

      it('should remove double quotes', () => {
        // Double quotes are stripped, but letters pass through
        expect(sanitizeCustomerName('J"a"u"n')).toBe('Jaun');
      });

      it('should allow hyphens for compound names', () => {
        expect(sanitizeCustomerName('Mary-Jane')).toBe('Mary-Jane');
      });

      it('should remove pipe characters', () => {
        expect(sanitizeCustomerName('Juan | Perez')).toBe('Juan_Perez');
      });

      it('should remove semicolons', () => {
        const result = sanitizeCustomerName('Juan; alert(1);');
        expect(result).not.toContain(';');
      });

      it('should remove backslashes', () => {
        const result = sanitizeCustomerName('Juan\\nPerez');
        expect(result).not.toContain('\\');
      });

      it('should remove parentheses', () => {
        const result = sanitizeCustomerName('alert(1)');
        expect(result).not.toContain('(');
        expect(result).not.toContain(')');
      });

      it('should remove backticks', () => {
        expect(sanitizeCustomerName('J`an')).toBe('Jan');
      });
    });

    describe('Realistic XSS Payloads', () => {
      it('should block classic XSS probe by stripping script tags', () => {
        // HTML tags are stripped, but text content remains
        // This is secure for PDF printing since no HTML can be injected
        const result = sanitizeCustomerName('<script>alert(document.cookie)</script>');
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('</script>');
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
      });

      it('should block img onerror attack', () => {
        expect(sanitizeCustomerName('<img src=x onerror=alert(1)>')).toBe('');
      });

      it('should block svg onload attack', () => {
        expect(sanitizeCustomerName('<svg onload=alert(1)>')).toBe('');
      });

      it('should block body onload attack', () => {
        expect(sanitizeCustomerName('<body onload=alert(1)>')).toBe('');
      });

      it('should block input onfocus attack', () => {
        expect(sanitizeCustomerName('<input onfocus=alert(1)>')).toBe('');
      });

      it('should remove HTML entities by stripping special chars', () => {
        const result = sanitizeCustomerName('&lt;script&gt;');
        expect(result).not.toContain('&lt;');
        expect(result).not.toContain('&gt;');
      });

      it('should block data: URL XSS', () => {
        const result = sanitizeCustomerName('<a href="data:text/html,<script>alert(1)</script>">');
        expect(result).not.toContain('data:');
        expect(result).not.toContain('<script>');
      });

      it('should block expression() CSS XSS', () => {
        const result = sanitizeCustomerName('<div style="width:expression(alert(1))">');
        expect(result).not.toContain('style=');
      });

      it('should block vbscript attack', () => {
        const result = sanitizeCustomerName('<script language="vbscript">msgbox(1)</script>');
        expect(result).not.toContain('language');
        expect(result).not.toContain('vbscript');
      });
    });
  });
});
