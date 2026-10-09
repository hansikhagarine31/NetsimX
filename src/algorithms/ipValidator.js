/**
 * IP Address & Subnet Validation Engine for NetSimX
 */

/**
 * Validates standard IPv4 string
 */
export function isValidIPv4(ip) {
  if (typeof ip !== 'string') return false;
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;

  return parts.every(part => {
    if (!/^\d+$/.test(part)) return false;
    const num = Number(part);
    return num >= 0 && num <= 255 && (part === '0' || !part.startsWith('0'));
  });
}

/**
 * Validates IPv4 Subnet Mask (must be contiguous 1s followed by 0s)
 */
export function isValidSubnetMask(mask) {
  if (!isValidIPv4(mask)) return false;

  const octets = mask.trim().split('.').map(Number);
  const binaryString = octets.map(o => o.toString(2).padStart(8, '0')).join('');

  // Subnet mask must match 1*0*
  return /^1*0*$/.test(binaryString);
}

/**
 * Converts IP string to 32-bit integer
 */
export function ipToInt(ip) {
  return ip
    .trim()
    .split('.')
    .reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

/**
 * Checks if IP and Gateway share the same network address
 */
export function isSameSubnet(ip1, ip2, mask) {
  if (!isValidIPv4(ip1) || !isValidIPv4(ip2) || !isValidSubnetMask(mask)) return false;

  const ip1Int = ipToInt(ip1);
  const ip2Int = ipToInt(ip2);
  const maskInt = ipToInt(mask);

  return (ip1Int & maskInt) === (ip2Int & maskInt);
}

/**
 * Validates device IP configuration completely
 */
export function validateDeviceConfig(device, existingNodes = []) {
  const errors = [];
  const warnings = [];

  const { ip, subnetMask, gateway, name, id } = device;

  if (ip) {
    if (!isValidIPv4(ip)) {
      errors.push(`"${ip}" is not a valid IPv4 address for ${name || 'Device'}.`);
    } else {
      // Check duplicate IP
      const duplicate = existingNodes.find(
        n => n.id !== id && n.data?.ip === ip && n.data?.status !== 'off'
      );
      if (duplicate) {
        errors.push(`Duplicate IP Address "${ip}" is already assigned to ${duplicate.data?.name || duplicate.id}.`);
      }
    }
  }

  if (subnetMask && !isValidSubnetMask(subnetMask)) {
    errors.push(`"${subnetMask}" is an invalid subnet mask for ${name || 'Device'}.`);
  }

  if (gateway && gateway !== '0.0.0.0' && gateway !== '') {
    if (!isValidIPv4(gateway)) {
      errors.push(`"${gateway}" is an invalid Default Gateway IP address.`);
    } else if (ip && subnetMask && isValidIPv4(ip) && isValidSubnetMask(subnetMask)) {
      if (!isSameSubnet(ip, gateway, subnetMask)) {
        warnings.push(`Default Gateway "${gateway}" is on a different subnet than device IP "${ip}".`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
