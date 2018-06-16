// import * as util from './util'
// import sha256 from 'js-sha256'

const util = require('./util')
const hexutil = require('./hexutil')
const sha256 = require('js-sha256').sha256

const HEADER_PADDING = [
  0x0000, 0x0080, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x8002, 0x0000,
]

const mine = function(job) {
  console.log('job', job);
  let blockHeader = generateBlockHeader(job, '33087548');
  let target = calculateTarget(job);
  console.log('header hex', blockHeader.hex);
  let hash = sha256(hexutil.convertToByteArray(blockHeader.hex))
  hash = sha256(hexutil.convertToByteArray(hash))
  console.log('hash', hash)
  hash = hexutil.reverseAllBytes(hash)
  hash = util.hexToUInt32Array(hash)
  console.log('hex hash', hash);
  console.log('target', target);
  console.log(isHashAWinner(target, hash) ? 'Worked' : 'Missed')
}

const isHashAWinner = function(target, hash) {
  let isWinner = true
  for (let i = 0; i < target.length; i++) {
    if (hash[i] < target[i]) {
      isWinner = true
      break
    } else if (hash[i] > target[i]) {
      isWinner = false
      break
    }
  }
  return isWinner;
}

const concatBlockHeader = function(header) {
  let concatHeader = '';
  const headerFields = [
    'version', 'previousBlockHash', 'merkleRoot', 'solutionTime',
    'bits', 'solutionNonce'
  ]
  headerFields.forEach(function(field) {
    concatHeader += header[field];
  })
  return concatHeader;
}

const generateHeaderPadding = function(header) {
  let messagelen = header.hex.length;
  let paddinglen = 128 - ((messagelen + 1 + 16) % 128)
  console.log('pad len', paddinglen)
  let padding = '8'
  for (let i = 0; i < paddinglen; i++) {
    padding += '0'
  }

  padding += '00000000'

  let binLen = messagelen * 4
  for (let i = 0; i < 4; i ++) {
    padding += hexutil.byteToHex((binLen >> 24 - (i * 8)) & 0xff)
  }

  console.log('padding', padding);
  return padding;
}

const generateBlockHeader = function(job, nonce) {
  const blockHeader = {
    version: hexutil.convertToLittleEndian(job.version),
    previousBlockHash: hexutil.convertToLittleEndian(job.previousBlockHash),
    //merkleRoot: hexutil.convertToLittleEndian(job.merkleRoot),
    merkleRoot: hexutil.reverseAllBytes(job.merkleRoot),
    solutionTime: hexutil.convertToLittleEndian(job.timestamp),
    bits: hexutil.convertToLittleEndian(job.bits),
    solutionNonce: hexutil.convertToLittleEndian(nonce),
    // headerPadding: HEADER_PADDING,
  };

  console.log('bHead', blockHeader);

  blockHeader.hex = '' + blockHeader.version + blockHeader.previousBlockHash + blockHeader.merkleRoot + blockHeader.solutionTime + blockHeader.bits + blockHeader.solutionNonce
  // blockHeader.hex += hexutil.convertToLittleEndian(generateHeaderPadding(blockHeader))
  return blockHeader;
}

const generateBlockHeaders = function(job, nonceOffset, numberOfHeaders) {
  let headers = []
  let nonce = parseInt(job.extranonce, 16) + job.nonceOffset + nonceOffset
  for (let i = 0; i < numberOfHeaders; i++) {
    headers.push(generateBlockHeader(job, nonce + i))
  }
  return headers;
}

const calculateTarget = function(job) {
  let bits = '';
  for (let i = 0; i < job.bits.length; i += 2) {
    let byte = job.bits.substring(i, i+2);
    if (i !== 0) bits += byte;
  }

  let numLastZeros = parseInt(job.bits.substr(0, 2), 16) - (bits.length / 2)

  for (let i = 0; i < numLastZeros; i++) {
    bits += '00';
  }

  let numLeadingZeros = 64 - bits.length
  let leadingZeros = '';

  for (let i = 0; i < numLeadingZeros; i++) {
    leadingZeros += '0';
  }

  bits = leadingZeros + bits;

  console.log('target calc', bits);

  return util.hexToUInt32Array(bits);
}

module.exports = {
  mine: mine,
}
