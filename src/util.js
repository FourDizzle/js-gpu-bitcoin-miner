function hexStringToUInt16(hex) {
  arr = []
  for (let i = 0; i < hex.length; i += 4) {
    arr.push(parseInt(hex.substring(i, i + 4), 16))
  }
  return arr;
}

const hexToUInt32Array = function(hex) {
  let len = hex.length
  let arrlength = len % 8 + ((len - (len % 8)) / 8)
  let arr = new Uint32Array(arrlength)
  for (let i = 0; i < hex.length; i += 8) {
    arr[(i / 8)] = parseInt(hex.substring(i, i + 8), 16)
  }
  return arr;
}

const hexToUInt16LittleEndian = function(hex) {
  return reverseUInt16(hexStringToUInt16(hex));
}

const hexToUInt32LittleEndian = function(hex) {
  return reverseUInt32Words(hexToUInt32Array(hex));
}

const reverseUInt32 = function(int) {
  return ((int << 24) & 0xff000000) |
    ((int << 8) & 0x00ff0000) |
    ((int >>> 8) & 0x0000ff00) |
    ((int >>> 24) & 0x000000ff);
}

const reverseUInt = function(int) {
  return ((int << 8) & 0x0000ff00 | (int >> 8) & 0x000000ff);
}

const reverseUInt16 = function(byteArray) {
  var arr = []
  for (let i = 0; i < byteArray.length - 1; i += 2) {
    arr.push(reverseUInt(byteArray[i+1]))
    arr.push(reverseUInt(byteArray[i]));
  }
  return arr;
}

const reverseUInt32Words = function(byteArray) {
  var arr = new Uint32Array(byteArray.length)
  for (let i = 0; i < byteArray.length; i++) {
    arr[i] = reverseUInt32(byteArray[i])
  }
  return arr;
}

const uInt8ArraytoUInt32Array = function(byteArray) {
  let arr = new Uint32Array(byteArray.length / 4);
  for (let i = 0; i < byteArray.length; i += 4) {
    arr[i/4] = ((byteArray[i] << 24) & 0xff000000) |
      ((byteArray[i+2] << 16) & 0x00ff0000) |
      ((byteArray[i+3] << 8) & 0x0000ff00) |
      ((byteArray[i+4]) & 0x000000ff)
  }
  return arr;
}

module.exports = {
  hexStringToUInt16: hexStringToUInt16,
  hexToUInt16LittleEndian: hexToUInt16LittleEndian,
  hexToUInt32LittleEndian: hexToUInt32LittleEndian,
  reverseUInt16Words: reverseUInt16,
  hexToUInt32Array: hexToUInt32Array,
  uInt8ArraytoUInt32Array: uInt8ArraytoUInt32Array,
}
