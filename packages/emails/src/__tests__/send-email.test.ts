/**
 * sendEmail Unit Tests
 * 
 * Tests for the sendEmail function validation logic and error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to ensure the mock is available at module scope
const { mockSend } = vi.hoisted(() => {
  return {
    mockSend: vi.fn(),
  };
});

// Mock the resend module
vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
  };
});

// Import sendEmail after mocking
import { sendEmail } from '../send-email';

describe('sendEmail', () => {
  // Store original env
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv };
    vi.clearAllMocks();
    mockSend.mockReset();
  });
  
  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('API Key Validation', () => {
    it('should return error when RESEND_API_KEY is not configured', async () => {
      delete process.env.RESEND_API_KEY;
      
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('RESEND_API_KEY not configured');
    });

    it('should return error when RESEND_API_KEY is empty string', async () => {
      process.env.RESEND_API_KEY = '';
      
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('RESEND_API_KEY not configured');
    });
  });

  describe('Email Format Validation', () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = 'test_api_key_123';
    });

    it('should return error for invalid email format (no @)', async () => {
      const result = await sendEmail({
        to: 'invalid-email',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid recipient email format');
    });

    it('should return error for empty recipient email', async () => {
      const result = await sendEmail({
        to: '',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid recipient email format');
    });

    it('should return error for null-like recipient email', async () => {
      const result = await sendEmail({
        // @ts-expect-error - Testing edge case
        to: null,
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid recipient email format');
    });
  });

  describe('Successful Email Send', () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = 'test_api_key_123';
      process.env.RESEND_FROM_EMAIL = 'onboarding@resend.dev';
      process.env.RESEND_FROM_NAME = 'Jardín Verde';
      mockSend.mockResolvedValue({
        data: { id: 'msg_abc123' },
        error: null,
      });
    });

    it('should return success with messageId when Resend accepts the email', async () => {
      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Welcome!',
        html: '<p>Hello world</p>',
      });
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg_abc123');
      expect(result.error).toBeUndefined();
    });

    it('should call Resend with correct parameters', async () => {
      await sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
      
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Test Subject',
          html: '<p>Test content</p>',
          from: 'Jardín Verde <onboarding@resend.dev>',
        })
      );
    });
  });

  describe('Resend API Error Handling', () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = 'test_api_key_123';
    });

    it('should return error when Resend API returns an error', async () => {
      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'Rate limit exceeded' },
      });
      
      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded');
    });

    it('should handle network errors gracefully', async () => {
      mockSend.mockRejectedValue(new Error('Network timeout'));
      
      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network timeout');
    });

    it('should handle unknown errors gracefully', async () => {
      mockSend.mockRejectedValue('Something went wrong');
      
      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('Default Sender Configuration', () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = 'test_api_key_123';
      mockSend.mockResolvedValue({
        data: { id: 'msg_abc123' },
        error: null,
      });
    });

    it('should use default from email when RESEND_FROM_EMAIL is not set', async () => {
      delete process.env.RESEND_FROM_EMAIL;
      delete process.env.RESEND_FROM_NAME;
      
      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });
      
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Jardín Verde <onboarding@resend.dev>',
        })
      );
    });

    it('should use custom from address when provided', async () => {
      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        from: 'Custom Name <custom@example.com>',
      });
      
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Custom Name <custom@example.com>',
        })
      );
    });
  });
});
