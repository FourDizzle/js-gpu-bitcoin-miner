const hexutil = require('./hexutil')
const sha256 = require('js-sha256').sha256
const services = require('./services')

let work
let headerIntArr
let nonce = 0
let target

let startTime = 0
let endTime = 0
let numhashes = 0

function start() {
  work = services.getWork()
}

function nonceToHex(nonce) {
  let zeros = '00000000'
  let num = (nonce & 0xffffffff).toString(16)
  return zeros.substring(0, 8 - num.length) + nonce
}

function isLessThanTarget(hash) {
  let isWinner = true
  for (let i = 0; i < target.length; i++) {
    if (hash[hash.length - i - 1] < target[i]) {
      isWinner = true
      break
    } else if (hash[hash.length - i - 1] > targetArr[i]) {
      isWinner = false
      break
    }
  }
  return isWinner;
}

function nonceToByteArray(nonce) {
  let arr = [
    (nonce >>> 24) & 0xFF,
    (nonce >>> 16) & 0xFF,
    (nonce >>> 8) & 0xFF,
    nonce & 0xFF
  ]
  return arr
}

function mine() {
  startTime = (new Date()).getTime()
  while (work && nonce < 0xffffffff) {
    let block = work.headerIntArr.concat(nonceToByteArray(nonce))
    let hash = sha256.update(block)
    hash = sha256.update(hash.digest())

    if (isLessThanTarget(hash.digest(), work.target)) {
      endTime = (new Date()).getTime()
      submitWork(work, nonce)
      break
    } else {
      nonce++
    }
  }
  reportProgress(work, nonce, numhashes, endTime - startTime)
}

function onmessage(e) {
  switch(e.data.action) {
    case 'work':
      if (newWork.id !== work.id) {
        work = newWork
        headerIntArr = hexutil.convertToByteArray(work.data.substring(0, 152))
        target = hexutil.convertToByteArray(work.target)
        nonce = work.nonceStart
      }
      mine()
      break
    case 'stop':
      work = undefined
      headerIntArr = undefined
      nonce = 0
      target = undefined
      startTime = 0
      numhashes = 0
      endTime = 0
  }
}

function submitWork(work, nonce) {
  postMessage({
    action: 'submit'
    work: work,
    nonce, nonce,
  })
}

function reportProgress(work, nonce, numhashes, duration) {
  let hashPerSec = numhashes / duration / 1000
  startTime = 0
  numhashes = 0
  endTime = 0

  postMessage({
    action: 'report',
    work: work,
    nonce: nonce,
    hashPerSec: hashPerSec
  })
}
