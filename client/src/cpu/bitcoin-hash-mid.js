const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

const H = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]

const DOUBLE_HASH_PAD = [
  0x80000000, 0x00000000, 0x00000000, 0x00000000,
  0x00000000, 0x00000000, 0x00000000, 0x00000100
]

const SHIFT = [24, 16, 8, 0];

function chopHexStringInto32Array(outarr, hexstr) {
  for (let i = 0; i < hexstr.length; i+= 8) {
    outarr[i/8] = parseInt(hexstr.substring(i, i+8), 16)
  }
}

function uint8ArrTo32Array(outarr, msg) {
  for (let i = 0; i < msg.length; i++) {
    outarr[i >> 2] |= msg[i] << SHIFT[i & 3];
  }
}

function isUint8Arr(msg) {
  return (typeof ArrayBuffer !== 'undefined' && msg.constructor === ArrayBuffer)
}

function addDblHashPad(outarr) {
  for (let i = 0; i < 8; i++) {
    outarr[i + 8] = DOUBLE_HASH_PAD[i]
  }
}

bitcoinHashWithMidstate = function(msg, midstate) {
  let hash = [], blocks = [], a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0,
    h = 0, s0 = 0, s1 = 0, maj = 0, t1 = 0, t2 = 0, ch = 0, ab = 0, da = 0,
    cd = 0, bc = 0

  if (typeof midstate === 'string') {
    chopHexStringInto32Array(hash, midstate)
  } else {
    uint8ArrTo32Array(hash, midstate)
  }

  if (typeof msg === 'string') {
    chopHexStringInto32Array(blocks, msg.substring(128))
    // console.log('Blocks:', blocks)
  } else {
    uint8ArrTo32Array(blocks, msg.slice(16))
  }

  for (let i = 1; i <= 2; i++) {
    // console.log(i + ' times loop attempted')

    if (i === 2) {
      for (let j = 0; j < 8; j++) {
        blocks[j] = hash[j]
        hash[j] = H[j]
      }
      addDblHashPad(blocks)
      // console.log('Blocks:', blocks)
    }

    a = hash[0], b = hash[1], c = hash[2], d = hash[3],
        e = hash[4], f = hash[5], g = hash[6], h = hash[7]

    for (let j = 16; j < 64; ++j) {
      // rightrotate
      t1 = blocks[j - 15];
      s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
      t1 = blocks[j - 2];
      s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
      blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
    }

    bc = b & c;
    for (let j = 0; j < 64; j += 4) {
      if (i === 3) {
        ab = 704751109;
        t1 = blocks[0] - 210244248;
        h = t1 - 1521486534 << 0;
        d = t1 + 143694565 << 0;
      } else {
        s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        ab = a & b;
        maj = ab ^ (a & c) ^ bc;
        ch = (e & f) ^ (~e & g);
        t1 = h + s1 + ch + K[j] + blocks[j];
        t2 = s0 + maj;
        h = d + t1 << 0;
        d = t1 + t2 << 0;
      }

      s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
      s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
      da = d & a;
      maj = da ^ (d & b) ^ ab;
      ch = (h & e) ^ (~h & f);
      t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
      t2 = s0 + maj;
      g = c + t1 << 0;
      c = t1 + t2 << 0;
      s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
      s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
      cd = c & d;
      maj = cd ^ (c & a) ^ da;
      ch = (g & h) ^ (~g & e);
      t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
      t2 = s0 + maj;
      f = b + t1 << 0;
      b = t1 + t2 << 0;
      s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
      s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
      bc = b & c;
      maj = bc ^ (b & d) ^ cd;
      ch = (f & g) ^ (~f & h);
      t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
      t2 = s0 + maj;
      e = a + t1 << 0;
      a = t1 + t2 << 0;
    }

    hash[0] = hash[0] + a << 0;
    hash[1] = hash[1] + b << 0;
    hash[2] = hash[2] + c << 0;
    hash[3] = hash[3] + d << 0;
    hash[4] = hash[4] + e << 0;
    hash[5] = hash[5] + f << 0;
    hash[6] = hash[6] + g << 0;
    hash[7] = hash[7] + h << 0;
  }

  let result = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    result[i] = (hash[i >> 2] & 0xff << SHIFT[i & 3]) >> SHIFT[i & 3]
  }

  return result;
}
