/**
 * Cyclic Redundancy Check (CRC) Laboratory Engine for NetSimX
 *
 * Implements modulo-2 binary division for CRC-12, CRC-16, CRC-CCITT, and custom polynomials.
 */

export const CRC_POLYNOMIALS = {
  'CRC-12': '1100000001111',     // x^12 + x^11 + x^3 + x^2 + x + 1
  'CRC-16': '11000000000000101', // x^16 + x^15 + x^2 + 1
  'CRC-CCITT': '11000100000010001' // x^16 + x^12 + x^5 + 1
};

/**
 * Converts String text to Binary bit string
 */
export function stringToBinary(text) {
  return text
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

/**
 * Converts Binary bit string back to String text
 */
export function binaryToString(binary) {
  const bytes = binary.match(/.{1,8}/g) || [];
  return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
}

/**
 * Performs XOR operation between two equal-length binary strings
 */
function xor(a, b) {
  let result = '';
  for (let i = 0; i < b.length; i++) {
    result += (a[i] === b[i]) ? '0' : '1';
  }
  return result;
}

/**
 * Modulo 2 binary division step-by-step calculation
 */
export function calculateCRC(dataBits, polynomialKey) {
  // Ensure dataBits is clean binary string
  const cleanData = dataBits.replace(/[^01]/g, '') || '1101011011';
  const poly = polynomialKey.replace(/[^01]/g, '') || CRC_POLYNOMIALS['CRC-16'];

  const degree = poly.length - 1;
  // Append degree zeros to data
  const paddedData = cleanData + '0'.repeat(degree);
  let workingBits = paddedData.slice(0, poly.length);

  const steps = [];

  let pointer = poly.length;

  while (pointer <= paddedData.length) {
    const isFirstBitOne = workingBits[0] === '1';
    const divisor = isFirstBitOne ? poly : '0'.repeat(poly.length);
    const xorResult = xor(workingBits, divisor);

    steps.push({
      stepIndex: steps.length + 1,
      currentWindow: workingBits,
      divisor,
      xorResult,
      nextBit: pointer < paddedData.length ? paddedData[pointer] : null
    });

    if (pointer < paddedData.length) {
      // Shift left and append next bit
      workingBits = xorResult.slice(1) + paddedData[pointer];
    } else {
      workingBits = xorResult.slice(1);
    }

    pointer++;
  }

  const remainder = workingBits.padStart(degree, '0');
  const transmittedFrame = cleanData + remainder;

  return {
    originalData: cleanData,
    polynomial: poly,
    paddedData,
    degree,
    remainder,
    transmittedFrame,
    steps
  };
}

/**
 * Verifies if receivedFrame is error-free using polynomial
 */
export function verifyCRC(receivedFrame, polynomialKey) {
  const cleanFrame = receivedFrame.replace(/[^01]/g, '');
  const poly = polynomialKey.replace(/[^01]/g, '');

  const degree = poly.length - 1;
  if (cleanFrame.length < poly.length) {
    return { isValid: false, remainder: 'INVALID', error: 'Frame length shorter than polynomial degree.' };
  }

  let workingBits = cleanFrame.slice(0, poly.length);
  let pointer = poly.length;

  while (pointer <= cleanFrame.length) {
    const isFirstBitOne = workingBits[0] === '1';
    const divisor = isFirstBitOne ? poly : '0'.repeat(poly.length);
    const xorResult = xor(workingBits, divisor);

    if (pointer < cleanFrame.length) {
      workingBits = xorResult.slice(1) + cleanFrame[pointer];
    } else {
      workingBits = xorResult.slice(1);
    }
    pointer++;
  }

  const remainder = workingBits.padStart(degree, '0');
  const isValid = /^0+$/.test(remainder);

  return {
    isValid,
    remainder,
    dataBits: cleanFrame.slice(0, cleanFrame.length - degree),
    checkBits: cleanFrame.slice(cleanFrame.length - degree)
  };
}

/**
 * Injects bit error into frame at index
 */
export function injectBitError(frameBits, bitIndex = 0) {
  const cleanBits = frameBits.replace(/[^01]/g, '');
  if (cleanBits.length === 0) return frameBits;

  const idx = Math.max(0, Math.min(bitIndex, cleanBits.length - 1));
  const flipped = cleanBits[idx] === '0' ? '1' : '0';

  return cleanBits.substring(0, idx) + flipped + cleanBits.substring(idx + 1);
}
