/**
 * Data Link Layer Framing Laboratory Engine for NetSimX
 *
 * Implements Character Count, Character Stuffing, Bit Stuffing & Destuffing.
 */

/**
 * 1. CHARACTER COUNT FRAMING
 */
export function characterCountFrame(data, maxFrameSize = 5) {
  if (!data) return { frames: [], formattedOutput: '' };

  const chunks = [];
  for (let i = 0; i < data.length; i += maxFrameSize) {
    chunks.push(data.slice(i, i + maxFrameSize));
  }

  const frames = chunks.map((chunk, index) => {
    const count = chunk.length + 1; // Including header count character
    return {
      frameIndex: index + 1,
      headerCount: count,
      payload: chunk,
      frameString: `${count}${chunk}`
    };
  });

  return {
    frames,
    formattedOutput: frames.map(f => `[ ${f.frameString} ]`).join(' ')
  };
}

/**
 * 2. CHARACTER STUFFING & DESTUFFING
 */
export function characterStuffing(data, flag = 'FLAG', esc = 'ESC') {
  if (!data) return { stuffedFrame: '', recoveredData: '', replacements: [] };

  const replacements = [];
  let stuffedPayload = '';

  for (let i = 0; i < data.length; i++) {
    // Check if substring starts with FLAG or ESC
    if (data.substring(i).startsWith(flag)) {
      stuffedPayload += esc + flag;
      replacements.push({ index: i, original: flag, stuffed: esc + flag });
      i += flag.length - 1;
    } else if (data.substring(i).startsWith(esc)) {
      stuffedPayload += esc + esc;
      replacements.push({ index: i, original: esc, stuffed: esc + esc });
      i += esc.length - 1;
    } else {
      stuffedPayload += data[i];
    }
  }

  const stuffedFrame = `${flag} ${stuffedPayload} ${flag}`;

  // Destuffing simulation
  let recoveredData = '';
  let i = 0;

  while (i < stuffedPayload.length) {
    if (stuffedPayload.substring(i).startsWith(esc + flag)) {
      recoveredData += flag;
      i += (esc + flag).length;
    } else if (stuffedPayload.substring(i).startsWith(esc + esc)) {
      recoveredData += esc;
      i += (esc + esc).length;
    } else {
      recoveredData += stuffedPayload[i];
      i++;
    }
  }

  return {
    originalData: data,
    flag,
    esc,
    stuffedPayload,
    stuffedFrame,
    recoveredData,
    replacements
  };
}

/**
 * 3. BIT STUFFING & DESTUFFING
 */
export function bitStuffing(bitString) {
  const cleanBits = bitString.replace(/[^01]/g, '') || '01111110111110';

  let stuffedBits = '';
  let consecutiveOnes = 0;
  const insertedIndices = []; // Indices in stuffedBits where 0 was inserted

  for (let i = 0; i < cleanBits.length; i++) {
    const bit = cleanBits[i];
    stuffedBits += bit;

    if (bit === '1') {
      consecutiveOnes++;
      if (consecutiveOnes === 5) {
        // Insert a '0'
        stuffedBits += '0';
        insertedIndices.push(stuffedBits.length - 1);
        consecutiveOnes = 0; // Reset count
      }
    } else {
      consecutiveOnes = 0;
    }
  }

  // Destuffing
  let destuffedBits = '';
  let onesCount = 0;
  const removedIndices = [];

  for (let i = 0; i < stuffedBits.length; i++) {
    const bit = stuffedBits[i];

    if (bit === '1') {
      onesCount++;
      destuffedBits += bit;
    } else if (bit === '0') {
      if (onesCount === 5) {
        // Skip this stuffed zero
        removedIndices.push(i);
        onesCount = 0;
      } else {
        onesCount = 0;
        destuffedBits += bit;
      }
    }
  }

  return {
    originalBits: cleanBits,
    stuffedBits,
    insertedIndices,
    destuffedBits,
    removedIndices,
    isValidMatch: cleanBits === destuffedBits
  };
}
