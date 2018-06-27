import { toUint16Array } from '../hexutil'
import { requestIteration, cancelIteration } from '../request-iteration'
import setupWebgl from './setup-webgl-1'
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
  this.process.onmessage({
    action: 'report',
    work,
    nonce,
    numhashes: hashes,
    duration,
    hashPerSec: hashes * 1000 / duration,
    timestamp: now,
  })

  this.batchStart = (new Date()).getTime()
  this.batchProgress = 0
}

function mine() {
  let n = toUint16Array(this.nonce)
  this.webgl.uniform2fv(nonceLoc,  n)

  this.webgl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  this.webgl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, this.buf)

  for (var i=0; i<buf.length; i+=4) {
    if (isSubmittable(this.buf)) {
      this.process.onmessage({
        action: 'submit',
        work: this.work,
        nonce: this.nonce,
      })
    }
  }

  if (this.nonce >= this.work.nonceEnd || this.nonce >= 0xFFFFFFFF) {
    cancelIteration(this.mineIteration)
  } else {
    this.nonce += this.threads
    if (this.batchProgress += this.threads >= batchSize)
      reportBatchProgress(this.batchStart, this.batchProgress, this.work)
    this.mineIteration = requestIteration(mine)
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
  }

  Object.setPrototypeOf(cpuMiner, glMiner)

  glMiner.setUp = function(options) {
    this.webgl = setupWebgl()
    this.process.interuptMessage = (msg) => {
      if (msg.action === 'work' && (!this.work || this.work.id !== msg.work.id)) {
        cancelIteration(this.mineIteration)
        this.work = msg.work
        this.nonce = msg.work.nonceStart || 0
        this.webgl.addWork(this.work)
        this.mineIteration = requestIteration(mine)
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
          hashPerSec: message.numhashes,
          duration: message.duration,
          numhashes: message.numhashes,
          timestamp: message.timestamp,
        })
      } else if (message.action === 'requestWork' && typeof this.requestWorkCb === 'function') {
        this.requestWorkCb()
      }
    }
  }

  return glMiner
}
