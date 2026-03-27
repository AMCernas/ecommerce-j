/**
 * SPEI CLABE Generation Utility
 * 
 * CLABE (Clave Bancaria Estandarizada) is an 18-digit standardized bank reference
 * used for bank transfers in Mexico's SPEI system.
 * 
 * Format:
 * - Digits 0-2: Bank code (STP = 646)
 * - Digits 3-4: Session/account type (00)
 * - Digits 5-15: 11-digit unique reference
 * - Digits 16-17: Check digits (mod97 algorithm)
 */

const STP_BANK_CODE = '646';

/**
 * Generates a unique 11-digit reference number
 * Uses a combination of timestamp and order ID hash for uniqueness
 */
function generateReference(orderId: string, timestampMs: number): string {
  // Create a numeric hash from orderId
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    const char = orderId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Ensure positive and pad to reasonable length
  const absoluteHash = Math.abs(hash);
  const timestamp = timestampMs % 100000000000; // Last 11 digits of timestamp
  
  // Combine hash and timestamp, then pad to 11 digits
  const combined = (absoluteHash * 1000 + (timestamp % 1000)) % 100000000000;
  
  return combined.toString().padStart(11, '0');
}

/**
 * Calculates CLABE check digits using mod97 algorithm
 * 
 * The algorithm:
 * 1. Take the first 16 digits as number N
 * 2. Calculate checkDigits = (98 - (N * 100 % 97)) % 97
 * 3. Append check digits to get 18-digit CLABE
 * 
 * This ensures that CLABE % 97 = 1
 */
function calculateCheckDigits(first16Digits: string): string {
  // Convert first 16 digits to BigInt for accurate calculation
  const first16Num = BigInt(first16Digits);
  
  // Calculate N * 100 % 97
  const N_100_mod_97 = (first16Num * 100n) % 97n;
  
  // Check digit calculation: (98 - (N * 100 % 97)) % 97
  const checkDigit = Number((98n - N_100_mod_97) % 97n);
  
  return checkDigit.toString().padStart(2, '0');
}

/**
 * Validates a CLABE using mod97 algorithm
 * 
 * A valid CLABE satisfies: CLABE % 97 = 1
 */
export function validateCLABE(clabe: string): boolean {
  // Must be exactly 18 digits
  if (!/^\d{18}$/.test(clabe)) {
    return false;
  }
  
  // CLABE % 97 must equal 1 for valid check digits
  const clabeNum = BigInt(clabe);
  return clabeNum % 97n === 1n;
}

/**
 * Generates an SPEI CLABE for a given order
 * 
 * @param orderId - The order UUID
 * @param amount - Amount in MXN cents (not used in CLABE, but for reference)
 * @returns 18-digit CLABE string
 */
export function generateCLABE(orderId: string, amount?: number): string {
  const timestampMs = Date.now();
  
  // Generate reference (digits 5-16)
  const reference = generateReference(orderId, timestampMs);
  
  // Build first 16 digits: bank code (3) + session (2) + reference (11) = 16
  const first16 = STP_BANK_CODE + '00' + reference;
  
  // Calculate check digits (digits 17-18)
  const checkDigits = calculateCheckDigits(first16);
  
  return first16 + checkDigits;
}

/**
 * Parses a CLABE into its components
 */
export interface ParsedCLABE {
  bankCode: string;
  sessionNumber: string;
  reference: string;
  checkDigits: string;
}

/**
 * Parses a CLABE string into its components
 */
export function parseCLABE(clabe: string): ParsedCLABE | null {
  if (!validateCLABE(clabe)) {
    return null;
  }
  
  return {
    bankCode: clabe.substring(0, 3),
    sessionNumber: clabe.substring(3, 5),
    reference: clabe.substring(5, 16), // 11 digits (positions 5-15)
    checkDigits: clabe.substring(16, 18),
  };
}

/**
 * Generates CLABE result object for API response
 */
export function generateCLABEResult(
  orderId: string,
  amount: number,
  companyName: string,
  expiryHours: number = 72
): {
  clabe: string;
  bank: string;
  beneficiary: string;
  reference: string;
  amount: number;
  expiresAt: Date;
} {
  const clabe = generateCLABE(orderId, amount);
  const parsed = parseCLABE(clabe);
  
  return {
    clabe,
    bank: 'STP',
    beneficiary: companyName.toUpperCase(),
    reference: parsed?.reference ?? '',
    amount,
    expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
  };
}
