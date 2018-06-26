import { convertToByteArray } from './hexutil'
import { sha256 } from 'js-sha256'

import { requestIteration, cancelIteration } from './request-iteration'

let work
let headerIntArr
let nonce = 0
let target

let mineIteration = null

let mineInterval
let batchSize = 500000

let avgIndex = 0
let lastTenTimes = 0
let avgMainTime = 0

let debug = true

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
    } else if (hash[hash.length - i - 1] > target[i]) {
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
  let duration = 0
  let startTime = (new Date()).getTime()
  let batchDiff = 0
  let finished = false
  let hash
  for (let i = 0; i < batchSize; i++) {
    let block = headerIntArr.concat(nonceToByteArray(nonce))
    hash = sha256.update(block)
    hash = sha256.update(hash.digest())

    if (isLessThanTarget(hash.digest(), work.target)) {
      submitWork(work, nonce)
    } else if (nonce >= 0xFFFFFFFF) {
      batchDiff = batchSize - i + 1
      finished = true
      break;
    } else {
      nonce++
    }
  }
  duration = (new Date()).getTime() - startTime

  if (finished) finishedWork()

  if (debug) reportProgress(batchSize - batchDiff, duration, hash)

  mineIteration = requestIteration(mine)
}

function submitWork(work, nonce) {
  postMessage({
    action: 'submit',
    work: work,
    nonce, nonce,
  })
}

function finishedWork() {
  // cancelIteration(mineIteration)
  console.log('FINISHED')
}

function reportProgress(numhashes, duration, hash) {
  let now = new Date()

  postMessage({
    action: 'report',
    work,
    nonce,
    numhashes,
    duration,
    timestamp: (new Date()),
    lastHash: hash.hex(),
  })
}

function reset() {
  cancelIteration(mineIteration)
  work = undefined
  headerIntArr = undefined
  nonce = 0
  target = undefined
  avgIndex = 0
  lastTenTimes = 0
  avgMainTime = 0
}

onmessage = function(e) {
  switch(e.data.action) {
    case 'work':
      let newWork = e.data.work
      if (!work || newWork.id !== work.id) {
        work = newWork
        headerIntArr = convertToByteArray(work.data.substring(0, 152))
        target = convertToByteArray(work.target)
        nonce = work.nonceStart || 0
      }
      mineIteration = requestIteration(mine)
      break;
    case 'stop':
      console.log('STOPPING CPU MINER')
      reset()
      break;
  }
}
