const Emitter = require('tiny-emitter')
import setupWebgl from './setup-webgl-1'
import shaders from './webgl-shaders'
import { requestIteration, cancelIteration } from '../request-iteration'
import { reverseAllBytes } from '../hexutil'

function calcTargetColor(target) {
  let val = 0
  for (let i = 0; i < 64; i+=8) {
    let val = parseInt(target.substring(i, i+8), 16)
    if (val !== 0) break;
  }

  let color = new Uint8Array(4)
  for (let i = 0; i < 4; i++) {
    let shift = (8 * (3 - i))
    let mask = 0xff << shift
    color[i] = (val & mask) >>> shift
  }

  return color;
}

function targetColorToNumber(targetColor) {
  let target = 0

  for (let i = 0; i < 4; i++) {
    let shift = (8 * (3 - i))
    target += targetColor[i] << shift
  }

  return target;
}

const processProto = {
  mine: function() {
    let startNonce = this.glMiner.nonce
    this.glMiner.mine()
    console.log(startNonce)

    for (let i = 0; i < this.buf.length; i+=4) {
      let pixel = 0
      pixel += (this.buf[i] << 24) >>> 0
      pixel += (this.buf[i+1] << 16) >>> 0
      pixel += (this.buf[i+2] << 8) >>> 0
      pixel += this.buf[i+3]
      if (pixel <= this.targetColorValue) {
        console.log('submit target: ' + this.targetColorValue + ' pixel: ' + pixel)
        // console.log('submit', this.work, startNonce + i/4)
        this.submitWork(this.work, startNonce + i/4)
      }
    }

    this.iterationId = requestIteration(this.mine.bind(this))
  },

  updateWork: function(work) {
    cancelIteration(this.iterationId)
    this.work = work
    this.glMiner.addWork(work)
    this.targetColor = calcTargetColor(reverseAllBytes(work.target))
    this.targetColorValue = parseInt('007fff800', 16)
    this.iterationId = requestIteration(this.mine.bind(this))
  },

  submitWork: function(work, nonce) {
    this.events.emit('submit', work, nonce)
  },
}

export default function(events) {
  let process = {}
  Object.setPrototypeOf(process, processProto)

  process.iterationId = null
  process.events = events || new Emitter()

  process.setup = (options) => {
    options = options || {}
    options.debug = options.debug || false
    options.threads = options.threads || 640

    process.glMiner = setupWebgl(options.threads, shaders, options)
    process.buf = process.glMiner.buf

    process.events.on('new-work', process.updateWork.bind(process))
    process.events.on('work', process.updateWork.bind(process))
    process.events.on('stop', () => {
      cancelIteration(process.iterationId)
    })
  }

  return process;
}
