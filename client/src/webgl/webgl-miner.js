import { toUint16Array } from '../hexutil'
import { requestIteration, cancelIteration } from '../request-iteration'
import setupWebgl from './setup-webgl-1'
import webglShaders from './webgl-shaders'
import miner from '../miner'

function isSubmittable(buf) {
  if (buf[0] === 0 && buf[1] === 1 && buf[2] === 0 && buf[3] === 1) {
    return true
  } else {
    return false
  }
}

function reportBatchProgress(start, hashes, work) {
  let now = new Date()
  let duration = now.getTime() - start
  let hashPerSec = (hashes / duration) * 1000
  this.process.onmessage({
    action: 'report',
    work,
    nonce: this.nonce,
    numhashes: hashes,
    duration,
    hashPerSec,
    timestamp: now,
  })

  this.batchStart = (new Date()).getTime()
  this.batchProgress = 0
}

function mine() {
  let n = toUint16Array(this.nonce)
  this.webgl.updateNonce(n)

  this.webgl.drawArrays(this.webgl.TRIANGLE_STRIP, 0, 4)
  this.webgl.readPixels(0, 0, 10, 1, this.webgl.RGBA, this.webgl.UNSIGNED_BYTE, this.buf)

  for (var i = 0; i < this.buf.length; i+=4) {
    if (isSubmittable(this.buf)) {
      this.process.onmessage({
        action: 'submit',
        work: this.work,
        nonce: this.nonce,
      })
    }
  }

  this.batchProgress += this.threads

  if (this.nonce >= this.work.nonceEnd || this.nonce >= 0xFFFFFFFF) {
    cancelIteration(this.mineIteration)
  } else {
    this.nonce += this.threads
    if (this.batchProgress >= this.batchSize) {
      reportBatchProgress.call(this, this.batchStart, this.batchProgress, this.work)
    }
    this.mineIteration = requestIteration(this.mine.bind(this))
  }
}

function setup(options) {
  this.process = {}
  this.threads = 10
  this.webgl = this.setupWebgl(this.threads, webglShaders)
  this.process.interuptMessage = (msg) => {
    if (msg.action === 'work' && (!this.work || this.work.id !== msg.work.id)) {
      this.batchStart = (new Date()).getTime()
      cancelIteration(this.mineIteration)
      this.work = msg.work
      this.nonce = msg.work.nonceStart || 0
      this.webgl.addWork(this.work)
      this.mineIteration = requestIteration(this.mine.bind(this))
    } else if (msg.action === 'stop') {
      cancelIteration(this.mineIteration)
      console.log('Stopped WebGL Miner')
    }
  }

  this.process.onmessage = (msg) => {
    const message = msg
    if (message.action === 'submit' && this.submitCb === 'function') {
        this.submitCb({ work: work, nonce: nonce})
    } else if (message.action === 'report' && typeof this.requestWorkCb === 'function') {
      this.progressReportCb({
        work: message.work,
        nonce: message.nonce,
        hashPerSec: message.hashPerSec,
        duration: message.duration,
        numhashes: message.numhashes,
        timestamp: message.timestamp,
      })
    } else if (message.action === 'requestWork' && typeof this.requestWorkCb === 'function') {
      this.requestWorkCb()
    }
  }
}

export default function makeWebGlMiner(name) {
  let glMiner = {
    name,
    webgl: null,
    mineIteration: null,
    batchStart: 0,
    batchProgress: 0,
    work: null,
    nonce: null,
    mine,
    setup,
    setupWebgl,
    buf: new Uint8Array(10 * 1 * 4),
    batchSize: 10000,
  }

  Object.setPrototypeOf(glMiner, miner)

  console.log(glMiner)

  return glMiner
}
