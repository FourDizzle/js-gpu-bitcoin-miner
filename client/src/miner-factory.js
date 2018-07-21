const Emitter = require('tiny-emitter')
import detectWebGL from './detect-webgl'

import makeCpuProcess from './cpu/cpu-miner'
import makeWebGlProcess from './webgl-process'

const PROCESSES = {
  cpu: makeCpuProcess,
  webgl: makeWebGlProcess,
  webgl2: makeWebGlProcess,
}

const minerProto = {
  setup: function(options) {
    this.process.setup(options)

    this.services.onRequestProgress(() => {
      this.getProgress(this.services.reportProgress)
    })
    this.services.onUpdateJob(work => this.update(work))
    this.events.on('submit', (work, nonce) => {
      this.services.submitWork(work, nonce)
    })
    this.events.on('report-progress', (progress) => {
      this.services.reportProgress(progress)
      console.log('progress report:', progress)
    })
    this.events.on('new-work', (work) => {
      this.update(work)
    })
    this.events.on('finished-work', (work) => {
      console.log('finished work:', work)
      this.services.getWork(work => this.update(work))
    })
  },

  start: function(work) {
    if (work) {
      update(work)
    } else {
      console.log('asking for work')
      this.services.getWork(work => this.update(work))
    }
  },

  update: function(work) {
    console.log('updating work')
    this.currentWork = work
    this.events.emit('new-work', work)
    console.log(work)
  },

  getProgress: function(callback) {
    if (typeof callback === 'function')
      this.events.once('report-progress', callback)
    this.events.emit('request-progress')
  },

  stop: function() {
    console.log('stopping', this.name)
    this.events.emit('stop')
  },

  close: function() {
    this.events.emit('close')
  },
}

export default function(services, options) {
  // let minerType = options.minerType || detectWebGL()
  // webgl implementation 10x slower than cpu. need to seriously optimize
  let minerType = 'cpu'
  console.log('miner-type', minerType)

  let miner = {}
  Object.setPrototypeOf(miner, minerProto)

  miner.events = new Emitter();
  miner.name = minerType + '-miner-' + Math.floor(Math.random() * 99999)
  miner.services = services
  miner.process = PROCESSES[minerType](miner.events)

  return miner;
}
