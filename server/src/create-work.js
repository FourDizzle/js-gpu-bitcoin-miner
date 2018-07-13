var hexutil = require('./hexutil');
var hash = require('./sha256')

const HASH1 = '000000000000000000000000000000000000000000000000000000000000000'
  + '08000000000000000000000000000000000000000000000000000000000000100'
const HEADER_PADDING = '800000000000000000000000000000000000000000000000000000'
  + '000000000000000000000000000000000000000280'

function calculateCoinbase(job, extranonce2, session) {
  let coinbase = job.coinb1 + session.extranonce1 + extranonce2 + job.coinb2
  return hash.doubleSha256(coinbase)
}

function calculateMerkleRoot(merkleBranch, coinbaseHash) {
  let merkleRoot = coinbaseHash
  for (let i = 0; i < merkleBranch.length; i++) {
    merkleRoot = hash.doubleSha256(merkleRoot + merkleBranch[i])
  }
  return hexutil.convertToLittleEndian(merkleRoot)
}

function calcNetworkTarget(nbits) {
  var target = nbits.substring(2)
  var numbytes = parseInt(nbits.substring(0,2), 16);
  for (let i = 0; i < numbytes - 3; i++) {
    target += '00'
  }
  for (let i = 0; i < 64 - numbytes; i++) {
    target = '00' + target
  }
  return target
}

function generateExtranonce2(size) {
  let bitMaskStr = ''
  for (let i = 0; i < size; i++) {
    bitMaskStr += 'ff'
  }
  let bitMask =  parseInt(bitMaskStr, 16)
  let extranonce2 = Math.random() * bitMask

  return hexutil.numToNByteHex(extranonce2, size)
}

function createWork(job, session, options) {
  let work = {}
  options = options || {}

  let extranonce2 = options.extranonce2 || generateExtranonce2(session.extranonce2Size)
  let coinbase = calculateCoinbase(job, extranonce2, session)
  let merkleRoot = calculateMerkleRoot(job.merkleBranch, coinbase)
  let blockHeader = job.version + job.prevhash + merkleRoot
    + job.ntime + job.nbits + '00000000' + HEADER_PADDING
  blockHeader = hexutil.convertToLittleEndian(blockHeader)
  let midstate = hash.calcMidstate(blockHeader)

  work.id = job.id
  work.extranonce2 = extranonce2
  work.nTime = job.ntime
  work.target = hexutil.reverseAllBytes(session.shareTarget)
  work.data = blockHeader
  work.midstate = midstate
  work.hash1 = HASH1
  work.nonceStart = 0
  work.nonceEnd = 0xffffffff
  work.extranonce2 = extranonce2

  return work;
}

module.exports = createWork
