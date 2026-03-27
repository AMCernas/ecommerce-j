import { NextRequest, NextResponse } from 'next/server';

// Mock SPEI CLABE generation
// In production, this would integrate with a bank aggregator like STP, Conekta, or similar
// that provides Mexican bank transfer capabilities

function generateCLABE(): string {
  // Generate a valid 18-digit CLABE
  // First 3 digits: Bank code (STP = 646)
  // Next 3 digits: Card type (000 = regular)
  // Next 10 digits: Account number (random)
  // Last digit: Checksum (calculated)
  
  const stpCode = '646';
  const cardType = '000';
  const accountNumber = Array.from({ length: 10 }, () => 
    Math.floor(Math.random() * 10)
  ).join('');
  
  // Simple checksum calculation for mock purposes
  const partialCLABE = stpCode + cardType + accountNumber;
  const checksum = (10 - (partialCLABE.split('').reduce((acc, digit, idx) => 
    acc + parseInt(digit) * (idx % 3 === 0 ? 3 : idx % 3 === 1 ? 7 : 1), 0
  ) % 10)) % 10;
  
  return partialCLABE + checksum;
}

function generateReference(): string {
  // Generate a unique reference number
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `JV${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, customerEmail } = await request.json();

    if (!orderId || !amount || !customerEmail) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Generate mock SPEI data
    // In production, this would call a real SPEI provider API
    const clabe = generateCLABE();
    const reference = generateReference();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2); // SPEI references expire in 2 days

    // Log for debugging (remove in production)
    console.log('SPEI CLABE generated for order:', orderId, { clabe, reference });

    return NextResponse.json({
      clabe,
      bank: 'STP',
      beneficiary: 'Jardín Verde S.A. de C.V.',
      reference,
      amount: amount / 100, // Convert from cents
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error generating SPEI CLABE:', error);
    return NextResponse.json(
      { error: 'Error al generar la CLABE' },
      { status: 500 }
    );
  }
}
