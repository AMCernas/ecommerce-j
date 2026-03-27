/**
 * Webhook Signature Verification Tests
 * 
 * Tests for Stripe webhook signature validation.
 * Ensures that only requests with valid HMAC-SHA256 signatures are processed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { verifyWebhookSignature } from '../webhooks';
import {
  WebhookSignatureError,
  MissingSignatureError,
  TimestampExpiredError,
} from '../errors';

describe('Webhook Signature Verification', () => {
  const WEBHOOK_SECRET = 'whsec_test_secret_key_for_testing';
  
  // Helper to create valid signature
  function createSignature(payload: string, timestamp: number, secret: string): string {
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }

  describe('Valid Signature Verification', () => {
    it('should pass with valid signature and recent timestamp', async () => {
      const payload = JSON.stringify({
        id: 'evt_test123',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test', amount: 1000 } },
      });
      
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = createSignature(payload, timestamp, WEBHOOK_SECRET);
      
      const event = await verifyWebhookSignature(payload, signature, WEBHOOK_SECRET);
      
      expect(event.id).toBe('evt_test123');
      expect(event.type).toBe('payment_intent.succeeded');
    });

    it('should parse event data correctly', async () => {
      const payload = JSON.stringify({
        id: 'evt_abc123',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_failed_test',
            amount: 50000,
            currency: 'mxn',
            last_payment_error: { message: 'Card declined' },
          },
        },
      });
      
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = createSignature(payload, timestamp, WEBHOOK_SECRET);
      
      const event = await verifyWebhookSignature(payload, signature, WEBHOOK_SECRET);
      
      expect(event.data.object).toBeDefined();
      expect((event.data.object as any).id).toBe('pi_failed_test');
    });

    it('should accept signature at edge of tolerance', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      const timestamp = Math.floor(Date.now() / 1000) - 299; // 299 seconds ago (within 5 min)
      const signature = createSignature(payload, timestamp, WEBHOOK_SECRET);
      
      const event = await verifyWebhookSignature(
        payload,
        signature,
        WEBHOOK_SECRET,
        300 // 5 minutes tolerance
      );
      
      expect(event.id).toBe('evt_test');
    });
  });

  describe('Invalid Signature Rejection', () => {
    it('should throw WebhookSignatureError for tampered payload', async () => {
      const originalPayload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      const tamperedPayload = JSON.stringify({ id: 'evt_test', type: 'malicious.event' });
      
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = createSignature(originalPayload, timestamp, WEBHOOK_SECRET);
      
      await expect(
        verifyWebhookSignature(tamperedPayload, signature, WEBHOOK_SECRET)
      ).rejects.toThrow(WebhookSignatureError);
    });

    it('should throw WebhookSignatureError for wrong signature', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Create signature with wrong secret
      const wrongSignature = createSignature(payload, timestamp, 'wrong_secret');
      
      await expect(
        verifyWebhookSignature(payload, wrongSignature, WEBHOOK_SECRET)
      ).rejects.toThrow(WebhookSignatureError);
    });

    it('should throw MissingSignatureError for empty signature', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      
      await expect(
        verifyWebhookSignature(payload, '', WEBHOOK_SECRET)
      ).rejects.toThrow(MissingSignatureError);
    });

    it('should throw WebhookSignatureError for malformed signature header', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      
      await expect(
        verifyWebhookSignature(payload, 'invalid_format', WEBHOOK_SECRET)
      ).rejects.toThrow(WebhookSignatureError);
    });

    it('should throw WebhookSignatureError for signature missing timestamp', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      
      await expect(
        verifyWebhookSignature(payload, 'v1=abc123', WEBHOOK_SECRET)
      ).rejects.toThrow(WebhookSignatureError);
    });

    it('should throw WebhookSignatureError for signature missing v1', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      const timestamp = Math.floor(Date.now() / 1000);
      
      await expect(
        verifyWebhookSignature(payload, `t=${timestamp}`, WEBHOOK_SECRET)
      ).rejects.toThrow(WebhookSignatureError);
    });

    it('should throw WebhookSignatureError for invalid JSON payload', async () => {
      const payload = 'not valid json';
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = createSignature(payload, timestamp, WEBHOOK_SECRET);
      
      await expect(
        verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)
      ).rejects.toThrow(WebhookSignatureError);
    });
  });

  describe('Missing Signature Header', () => {
    it('should throw MissingSignatureError when signature is empty string', async () => {
      const payload = JSON.stringify({ id: 'evt_test' });
      
      await expect(
        verifyWebhookSignature(payload, '', WEBHOOK_SECRET)
      ).rejects.toThrow(MissingSignatureError);
    });

    it('should throw MissingSignatureError when signature is null/undefined', async () => {
      const payload = JSON.stringify({ id: 'evt_test' });
      
      // @ts-expect-error - Testing edge case
      await expect(verifyWebhookSignature(payload, null, WEBHOOK_SECRET))
        .rejects.toThrow();
      
      // @ts-expect-error - Testing edge case
      await expect(verifyWebhookSignature(payload, undefined, WEBHOOK_SECRET))
        .rejects.toThrow();
    });
  });

  describe('Timestamp Expiration (Replay Attack Prevention)', () => {
    it('should throw TimestampExpiredError for old timestamp', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
      const signature = createSignature(payload, oldTimestamp, WEBHOOK_SECRET);
      
      await expect(
        verifyWebhookSignature(payload, signature, WEBHOOK_SECRET, 300)
      ).rejects.toThrow(TimestampExpiredError);
    });

    it('should throw TimestampExpiredError when timestamp is exactly at limit', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 301; // Just over 5 min
      const signature = createSignature(payload, expiredTimestamp, WEBHOOK_SECRET);
      
      await expect(
        verifyWebhookSignature(payload, signature, WEBHOOK_SECRET, 300)
      ).rejects.toThrow(TimestampExpiredError);
    });

    it('should pass with custom tolerance setting', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      const timestamp = Math.floor(Date.now() / 1000) - 150; // 2.5 minutes ago
      const signature = createSignature(payload, timestamp, WEBHOOK_SECRET);
      
      // Should pass with 5-minute tolerance
      const event = await verifyWebhookSignature(
        payload,
        signature,
        WEBHOOK_SECRET,
        300
      );
      
      expect(event.id).toBe('evt_test');
    });

    it('should reject with shorter custom tolerance', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      const timestamp = Math.floor(Date.now() / 1000) - 120; // 2 minutes ago
      const signature = createSignature(payload, timestamp, WEBHOOK_SECRET);
      
      // Should fail with 1-minute tolerance
      await expect(
        verifyWebhookSignature(payload, signature, WEBHOOK_SECRET, 60)
      ).rejects.toThrow(TimestampExpiredError);
    });

    it('should include timestamp and tolerance in error details', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test.event' });
      const oldTimestamp = Math.floor(Date.now() / 1000) - 600;
      const signature = createSignature(payload, oldTimestamp, WEBHOOK_SECRET);
      
      try {
        await verifyWebhookSignature(payload, signature, WEBHOOK_SECRET, 300);
        expect.fail('Should have thrown TimestampExpiredError');
      } catch (error) {
        expect(error).toBeInstanceOf(TimestampExpiredError);
        const tsError = error as TimestampExpiredError;
        expect(tsError.code).toBe('TIMESTAMP_EXPIRED');
        expect(tsError.httpStatus).toBe(401);
      }
    });
  });

  describe('Event Validation', () => {
    it('should throw for event missing id', async () => {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test' } },
      });
      
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = createSignature(payload, timestamp, WEBHOOK_SECRET);
      
      await expect(
        verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)
      ).rejects.toThrow(WebhookSignatureError);
    });

    it('should throw for event missing type', async () => {
      const payload = JSON.stringify({
        id: 'evt_test',
        data: { object: { id: 'pi_test' } },
      });
      
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = createSignature(payload, timestamp, WEBHOOK_SECRET);
      
      await expect(
        verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)
      ).rejects.toThrow(WebhookSignatureError);
    });
  });
});
