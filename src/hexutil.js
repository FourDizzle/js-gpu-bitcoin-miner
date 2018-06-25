const convertToLittleEndian = function(hex) {
  let hexcopy = '';
  if (hex.substring(0, 2) === '0x') {
    hexcopy = hex.substring(2);
  } else {
    hexcopy = hex;
  }

  let paddingSize = hexcopy.length % 8;
  let padding = ''
  for (let i = 0; i < paddingSize; i++) {
    padding += '0'
  }

  hexcopy = padding + hexcopy

  let littleEndianHex = '';
  for (let i = 0; i < hexcopy.length; i += 8) {
    for (let j = 0; j <= 6; j += 2) {
      littleEndianHex += hexcopy.substring(i + (6 - j), i + (8 - j))
    }
  }

  return littleEndianHex;
}

const convertToByteArray = function(hex) {
  let arr = []
  for (let i = 0; i < hex.length; i += 2) {
    arr.push(parseInt(hex.substring(i, i+2), 16))
  }
  return arr
}

const byteToHex = function(byte) {
  let hexDigits = '0123456789abcdef'
  let b = byte & 0xff
  return hexDigits.charAt(b / 16) + hexDigits.charAt(b % 16);
}

const reverseAllBytes = function(hex) {
  rev = ''
  for (let i = 0; i < hex.length; i += 2) {
    rev += hex.substring(hex.length - 2 - i, hex.length - i)
  }
  return rev;
}

function toUint32Array(hex) {
  var array = new Uint32Array(hex.length / 8);
  for (let i = 0; i < hex.length; i += 8) {
    array[i/8] = parseInt(hex.substring(i, i+8), 16)
  }

  return array
}

module.exports = {
  convertToLittleEndian: convertToLittleEndian,
  convertToByteArray: convertToByteArray,
  byteToHex: byteToHex,
  reverseAllBytes: reverseAllBytes,
  toUint32Array: toUint32Array,
}
