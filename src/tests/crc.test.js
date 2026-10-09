import { describe, it, expect } from 'vitest';
import { calculateCRC, verifyCRC, injectBitError, CRC_POLYNOMIALS } from '../algorithms/crc.js';

describe('CRC Laboratory Engine', () => {
  const dataBits = '1101011011';
  const poly16 = CRC_POLYNOMIALS['CRC-16'];

  it('calculates CRC remainder and produces valid transmitted frame', () => {
    const crcRes = calculateCRC(dataBits, poly16);
    expect(crcRes.remainder.length).toBe(poly16.length - 1);
    expect(crcRes.transmittedFrame).toBe(dataBits + crcRes.remainder);

    const check = verifyCRC(crcRes.transmittedFrame, poly16);
    expect(check.isValid).toBe(true);
    expect(/^0+$/.test(check.remainder)).toBe(true);
  });

  it('detects bit corruption when bit error is injected', () => {
    const crcRes = calculateCRC(dataBits, poly16);
    const corruptedFrame = injectBitError(crcRes.transmittedFrame, 3);

    expect(corruptedFrame).not.toBe(crcRes.transmittedFrame);
    const check = verifyCRC(corruptedFrame, poly16);
    expect(check.isValid).toBe(false);
  });
});
