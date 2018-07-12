import { toUint16Array, byteToHex } from '../hexutil'
import { requestIteration, cancelIteration } from '../request-iteration'
import setupWebgl from './setup-webgl-1'
import webglShaders from './webgl-shaders'
import miner from '../miner'

function isSubmittable(buf) {
  // #00ff00ff - green is the color of success
  if (buf[0] === 0 && buf[1] === 255 && buf[2] === 0 && buf[3] === 255) {
    return true
  } else {
    return false
  }
}

const addWork = function(gl, params, work) {
  gl.uniform2fv(params.dataLoc, hexToUint16Array(work.data))
  gl.uniform2fv(params.hash1Loc, hexToUint16Array(work.hash1))
  gl.uniform2fv(params.midstateLoc, hexToUint16Array(work.midstate))
  gl.uniform2fv(params.targetLoc, hexToUint16Array(work.target))
}

const setup = function(options) {
  this.threads = options.threads
  let webglSetup = setupWebgl(this.threads, options.shaders, { debug: options.debug })
  this.gl = webglSetup.gl
  this.shaderParams = webglSetup.shaderParams
  this.debug = options.debug || false
  this.progressReport = options.progressReport
  this.reportBatchSize = options.reportBatchSize
  this.reportBatchStart = 0
  this.batchProgress = 0

  // this.process.interuptMessage = (msg) => {
  //   if (msg.action === 'work' && (!this.work || this.work.id !== msg.work.id)) {
  //     this.batchStart = (new Date()).getTime()
  //     cancelIteration(this.mineIteration)
  //     this.work = msg.work
  //     this.nonce = msg.work.nonceStart || 0
  //     this.webgl.addWork(this.work)
  //     this.mineIteration = requestIteration(this.mine.bind(this))
  //   } else if (msg.action === 'stop') {
  //     cancelIteration(this.mineIteration)
  //     console.log('Stopped WebGL Miner')
  //   }
  // }
  //
  // this.process.onmessage = (msg) => {
  //   const message = msg
  //   if (message.action === 'submit' && typeof this.submitCb === 'function') {
  //       this.submitCb({ work: message.work, nonce: message.nonce})
  //   } else if (message.action === 'report' && typeof this.requestWorkCb === 'function') {
  //     this.progressReportCb({
  //       work: message.work,
  //       nonce: message.nonce,
  //       hashPerSec: message.hashPerSec,
  //       duration: message.duration,
  //       numhashes: message.numhashes,
  //       timestamp: message.timestamp,
  //     })
  //   } else if (message.action === 'requestWork' && typeof this.requestWorkCb === 'function') {
  //     this.requestWorkCb()
  //   }
  // }
}

const mine = function(gl, threads, work, nonceLoc) {
  let nonce = work.nonceStart
  let height = 1, width = threads
  let buf = new Uint8Array(width * height * 4);

  function mainLoop() {
    gl.uniform2fv(nonceLoc, toUint16Array(nonce));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, buf)

    for (let i = 0; i < buf.length; i += 4) {
      if (debug) {
        let out = []
        out.push(byteToHex(buf[i]))
        out.push(byteToHex(buf[i+1]))
        out.push(byteToHex(buf[i+2]))
        out.push(byteToHex(buf[i+3]))
        console.log("rgba("+(i/4)+"): " + JSON.stringify(out))
      }

      if (isSubmittable(buf)) {
        this.process.onmessage({
          action: 'submit',
          work: this.work,
          nonce: this.nonce,
        })
      }
    }

    this.batchProgress += threads

    if (nonce >= work.nonceEnd || nonce >= 0xFFFFFFFF) {
      cancelIteration(this.mineIteration)
    } else {
      nonce += threads
      if (this.progressReport && this.batchProgress >= this.batchSize) {
        reportBatchProgress.call(this, this.batchStart, this.batchProgress, this.work)
      }
      this.mineIteration = requestIteration(this.mine.bind(this))
    }
  }

  this.mineIteration = requestIteration(mainLoop.bind(this))
}

export default function makeWebGlMiner(name) {

}
