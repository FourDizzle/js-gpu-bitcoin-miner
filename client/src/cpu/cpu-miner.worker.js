import { convertToByteArray, reverseAllBytes, convertToLittleEndian } from '../hexutil'
import { requestIteration, cancelIteration } from '../request-iteration'
import bitcoinHashWithMidstate from './bitcoin-hash-mid-no-convert'

const SHIFT = [0, 8, 16, 24]
const NONCE_INDEX = 19

let debug = false

let startTime
let batchSize = 500000
let work = {}
let header = []
let midstate = []
let hash = []
let target = []
let ntime = 0
let nonceStart = 0
let nonce = 0
let nonceEnd = 0xffffffff
let mineIteration

const convertTo32Array = (hex) => {
  let arr = new Uint32Array(hex.length / 8)
  for (let i = 0; i < hex.length; i+= 8) {
    arr[i/8] = parseInt(hex.substring(i, i+8), 16)
  }
  return arr;
}

const setNTime = () => {
  ntime = Math.floor((new Date()).getTime() / 1000)
}

const addNonceToHeader = () => {
  header[NONCE_INDEX] = 0
  for (let i = 0; i < 4; i++) {
    header[NONCE_INDEX] += ((nonce & 0xff << SHIFT[i&3]) >> SHIFT[i&3]) << SHIFT[3 - i&3]
  }
}

const littleEndianDec = (num) => {
  let result = 0
  for (let i = 0; i < 4; i++) {
    result += ((num & 0xff << SHIFT[i&3]) >> SHIFT[i&3]) << SHIFT[3 - i&3]
  }
  return result;
}

const isHashLessThanTarget = () => {
  for (let i = 0; i < 32; i++) {
    if (hash[31 - i] < target[i]) {
      return true;
    }

    if (hash[32-i] > target[i]) {
      return false;
    }
  }
  // if all are equal return true
  return true;
}

const submit = () => {
  console.log('Submit: ', { work: work, nonce: nonce, ntime: ntime })
  postMessage({
    action: 'submit',
    data: {
      work: work,
      nonce: nonce,
      ntime: ntime,
    }
  })
}

const reportWorkFinished = () => {
  postMessage({
    action: 'finished-work',
    data: work
  })
}

const mine = () => {
  let tempheader = new Uint32Array(header)

  for (let i = 0; i < batchSize; i++) {
    tempheader = header.slice()
    tempheader[NONCE_INDEX] = littleEndianDec(nonce)
    hash = bitcoinHashWithMidstate(tempheader, midstate)

    if (isHashLessThanTarget()) {
      submit()
    }

    nonce++
  }

  if (debug) console.log('Miner progress:', makeReport())

  if (nonce >= nonceEnd) {
    reportWorkFinished()
  } else {
    mineIteration = requestIteration(mine)
  }
}

const makeReport = () => {
  let duration = (new Date()).getTime() - startTime.getTime()
  return {
    startTime: startTime,
    duration: duration,
    numHashes: nonce - nonceStart,
    hashPerSecond: (nonce - nonceStart) / Math.floor(duration / 1000),
    work: work,
    hash: hash,
  };
}

const sendReport = () => {
  postMessage({
    action: 'report-progress',
    data: makeReport()
  })
}

onmessage = function(e) {
  switch(e.data.action) {
    case 'work':
      console.log('starting work')
      cancelIteration(mineIteration)
      startTime = new Date()
      batchSize = 1000000
      work = e.data.data
      let tempheader = convertTo32Array(convertToLittleEndian(work.data))
      header = Array.prototype.slice.call(tempheader)
      midstate = convertTo32Array(work.midstate)
      target = convertToByteArray(work.target)
      nonce = work.nonceStart || 0
      nonceStart = nonce
      nonceEnd = work.nonceEnd || 0xffffffff
      setNTime()
      mineIteration = requestIteration(mine)
      break;
    case 'request-progress':
      sendReport()
      break;
    case 'stop':
      console.log('STOPPING CPU MINER')
      cancelIteration(mineIteration)
      break;
  }
}
