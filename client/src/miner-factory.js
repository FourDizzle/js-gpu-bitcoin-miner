const Emitter = require('tiny-emitter')
import detectWebGL from './detect-webgl'

import makeCpuProcess from './cpu-process'
import makeWebGlProcess from './webgl-process'

const PROCESSES = {
  cpu: makeCpuProcess,
  webgl: makeWebGlProcess,
  webgl2: makeWebGlProcess,
}

const minerProto = {
  setup: function(options) {
    this.process.setup(options)

    this.services.onClearJobs((work) => {
      this.events.emit('clear-jobs', work)
    })

    this.events.on('submit', (work, nonce) => {
      this.services.submitWork(work, nonce)
    })
    this.events.on('need-new-work', () => {
      this.services.getWork(this.update)
    })
    this.events.on('report-progress', (progress) => {
      this.services.reportProgress(progress)
      console.log('progress report:', progress)
    })
    this.events.on('clear-jobs', (work) => {
      this.events.emit('update-work', work)
    })
    this.events.on('update-work', (work) => {
      this.update(work)
    })
  },

  start: function(work) {
    if (work) {
      update(work)
    } else {
      console.log('asking for work')
      this.services.getWork((work) => this.update(work))
    }
  },

  update: function(work) {
    console.log('updating work')
    this.currentWork = work
    this.events.emit('work', work)
    console.log(work)
  },

  stop: function() {
    console.log('stopping', this.name)
    this.events.emit('stop')
  },

  close: function() {
    this.events.emit('close')
  },
}

export default function(services) {
  let minerType = detectWebGL()
  console.log('miner-type', minerType)

  let miner = {}
  Object.setPrototypeOf(miner, minerProto)

  miner.events = new Emitter();
  miner.name = minerType + '-miner-' + Math.floor(Math.random() * 99999)
  miner.services = services
  miner.process = PROCESSES[minerType](miner.events)

  return miner;
}
