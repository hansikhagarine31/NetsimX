import { describe, it, expect } from 'vitest';
import { characterCountFrame, characterStuffing, bitStuffing } from '../algorithms/framing.js';

describe('Data Link Layer Framing Engine', () => {
  it('performs character count framing', () => {
    const res = characterCountFrame('HELLO', 3);
    expect(res.frames.length).toBe(2); // 'HEL' (count 4) and 'LO' (count 3)
    expect(res.frames[0].frameString).toBe('4HEL');
    expect(res.frames[1].frameString).toBe('3LO');
  });

  it('performs character stuffing and destuffing recovery', () => {
    const data = 'ABCFLAGXYZ';
    const res = characterStuffing(data, 'FLAG', 'ESC');
    expect(res.stuffedFrame).toContain('ESCFLAG');
    expect(res.recoveredData).toBe(data);
  });

  it('performs bit stuffing on 5 consecutive ones and recovers original bits', () => {
    const originalBits = '01111110111110';
    const res = bitStuffing(originalBits);
    expect(res.stuffedBits).toBe('0111110101111100');
    expect(res.destuffedBits).toBe(originalBits);
    expect(res.isValidMatch).toBe(true);
  });
});
