import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, customerEmail, customerName } = await request.json();

    if (!orderId || !amount || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent for OXXO
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'mxn',
      payment_method_types: ['oxxo'],
      receipt_email: customerEmail,
      metadata: {
        orderId,
      },
    });

    // Confirm the payment intent with OXXO
    const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method_data: {
        type: 'oxxo',
        billing_details: {
          email: customerEmail,
          name: customerName,
        },
      },
    });

    // OXXO vouchers are typically handled via the Stripe dashboard or a hosted page
    // For this implementation, we return the payment intent ID as reference
    // In production, you'd use Stripe's hosted voucher page or generate your own PDF
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // OXXO vouchers expire in 3 days

    return NextResponse.json({
      voucherUrl: `https://checkout.stripe.com/pay/${paymentIntent.id}`,
      expiresAt: expiresAt.toISOString(),
      amount: amount / 100, // Convert from cents
      reference: paymentIntent.id.slice(3, 18).toUpperCase(),
    });
  } catch (error) {
    console.error('Error creating OXXO voucher:', error);
    return NextResponse.json(
      { error: 'Error al generar el voucher de OXXO' },
      { status: 500 }
    );
  }
}
