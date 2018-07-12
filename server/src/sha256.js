const hexutil = require('./hexutil')

const H = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]

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
]

const HEADER_PADDING = [
  0x80000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000,
  0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000280
]

const REHASH_PADDING = [
  0x80000000, 0x00000000, 0x00000000, 0x00000000,
  0x00000000, 0x00000000, 0x00000000, 0x00000100,
]

const STR_HEADER_PADDING =
  '8000000000000000000000000000000000000000000000000'
  + '00000000000000000000000000000000000000000000280'

const STR_REHASH_PADDING =
  '800000000000000000000000000000000'
  + '0000000000000000000000000000100'

function toUint32Array(hex) {
  var array = new Uint32Array(hex.length / 8);
  for (let i = 0; i < hex.length; i += 8) {
    array[i/8] = parseInt(hex.substring(i, i+8), 16)
  }

  return array
}

function rrot(num, rot) {
  return (num >>> rot) | (num << 32-rot)
}

function chunkMessage(msgArr) {
  let chunks = [];
  for (let i = 0; i < msgArr.length; i += 16) {
    let chunk = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      chunk[j] = msgArr[j+i]
    }
    chunks.push(chunk)
  }
  return chunks
}

function concatHash(hash, next) {
  let out = hash + hexutil.numTo32bitshex(next)
  return out;
}

function padHex(len) {
  let L = len * 4
  let K = 512 - ((L + 1 + 64) % 512)
  let numZeroBytes = ((K + 1) / 8) - 1

  let padding = '80'
  for (let i = 0; i < numZeroBytes; i++) {
    padding += '00'
  }

  padding += '00000000'
  padding += hexutil.numTo32bitshex(L)

  return padding
}

function isValidPadding(hex) {
  let hexArr = toUint32Array(hex)
  let msgLen = hexArr[hexArr.length - 1] / 4
  let padding = hex.substring(msgLen, hex.length - 16)
  for (let i = 0; i < padding.length; i += 2) {
    if (i === 0 && padding.substring(i, i+2) !== '80') return false
    else if (i > 0 && padding.substring(i, i+2) !== '00') return false
  }
  return true
}

function prepare(hex) {
  let padding = '';
  if (hex.length === 160) {
    padding = STR_HEADER_PADDING
  } else if (hex.length === 64) {
    padding = STR_REHASH_PADDING
  } else if (hex.length * 4 % 512 === 0 && isValidPadding(hex)) {
    padding = ''
  } else {
    padding = padHex(hex.length)
  }

  //console.log('padded:', hex + padding)

  return toUint32Array(hex + padding)
}

function calcMidstate(hex) {
  let msgArr = prepare(hex)
  let chunks = chunkMessage(msgArr)

  return chunkSteps(H, chunks[0])
    .reduce(concatHash, '')
}

function sha256(msg) {
  let msgArr = prepare(msg)
  //console.log('arr', msgArr)
  let chunks = chunkMessage(msgArr)

  return chunks
    .reduce(chunkSteps, H)
    .reduce(concatHash, '')
}

function chunkSteps(hash, chunk) {
  let w = new Uint32Array(64)
  for (let i = 0; i < 16; i++) {
    w[i] = chunk[i]
  }
  for (let i = 16; i < 64; i++) {
    let s0 = (rrot(w[i-15], 7) ^ rrot(w[i-15], 18) ^ (w[i-15] >>> 3)) >>> 0
    let s1 = (rrot(w[i-2], 17) ^ rrot(w[i-2], 19) ^ (w[i-2] >>> 10)) >>> 0
    w[i] = (w[i-16] + s0 + w[i-7] + s1)
  }

  let a = hash[0], b = hash[1], c = hash[2], d = hash[3],
    e = hash[4], f = hash[5], g = hash[6], h = hash[7]

  for (let i = 0; i < 64; i++) {
    let s1 = (rrot(e, 6) ^ rrot(e, 11) ^ rrot(e, 25)) >>> 0
    let ch = ((e & f) ^ ((~e) & g)) >>> 0
    let temp1 = (h + s1 + ch + K[i] + w[i]) >>> 0
    let s0 = (rrot(a, 2) ^ rrot(a, 13) ^ rrot(a, 22)) >>> 0
    let maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0
    let temp2 = (s0 + maj) >>> 0

    h = g
    g = f
    f = e
    e = (d + temp1) >>> 0
    d = c
    c = b
    b = a
    a = (temp1 + temp2) >>> 0
  }

  let out = [0,0,0,0,0,0,0,0]
  out[0] = (hash[0] + a) >>> 0
  out[1] = (hash[1] + b) >>> 0
  out[2] = (hash[2] + c) >>> 0
  out[3] = (hash[3] + d) >>> 0
  out[4] = (hash[4] + e) >>> 0
  out[5] = (hash[5] + f) >>> 0
  out[6] = (hash[6] + g) >>> 0
  out[7] = (hash[7] + h) >>> 0

  return out
}

module.exports = {
  calcMidstate: calcMidstate,
  sha256: sha256,
  doubleSha256: function(hex) {
    return sha256(sha256(hex))
  },
}
