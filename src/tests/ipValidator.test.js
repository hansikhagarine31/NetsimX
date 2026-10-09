import { describe, it, expect } from 'vitest';
import { isValidIPv4, isValidSubnetMask, isSameSubnet, validateDeviceConfig } from '../algorithms/ipValidator.js';

describe('IP & Subnet Validation Engine', () => {
  it('validates IPv4 addresses correctly', () => {
    expect(isValidIPv4('192.168.1.1')).toBe(true);
    expect(isValidIPv4('192.168.1.500')).toBe(false);
    expect(isValidIPv4('abc.def.ghi.jkl')).toBe(false);
  });

  it('validates subnet masks correctly', () => {
    expect(isValidSubnetMask('255.255.255.0')).toBe(true);
    expect(isValidSubnetMask('255.255.240.0')).toBe(true);
    expect(isValidSubnetMask('255.255.123.0')).toBe(false);
  });

  it('checks subnet matching', () => {
    expect(isSameSubnet('192.168.1.10', '192.168.1.1', '255.255.255.0')).toBe(true);
    expect(isSameSubnet('192.168.1.10', '192.168.2.1', '255.255.255.0')).toBe(false);
  });

  it('detects duplicate IP addresses', () => {
    const existing = [
      { id: 'pc1', data: { name: 'PC1', ip: '192.168.1.10' } }
    ];
    const dev = { id: 'pc2', name: 'PC2', ip: '192.168.1.10' };
    const res = validateDeviceConfig(dev, existing);
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('Duplicate IP');
  });
});
