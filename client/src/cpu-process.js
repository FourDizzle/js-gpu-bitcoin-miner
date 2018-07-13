import Worker from './cpu-miner.worker.js'
const Emitter = require('tiny-emitter')

export default function(events) {
  let process = {}

  process.events = events || new Emitter()

  process.setup = (options) => {
    let worker = new Worker();

    let updateWork = (work) => {
      console.log('work', work)
      worker.postMessage({ action: 'work', work: work })
    }

    worker.onmessage = (e) => {
      let msg = e.data
      switch (msg.action) {
        case 'submit':
          process.events.emit('submit', msg.work, msg.nonce)
          break;
        case 'report':
          let progress = Object.assign({}, msg)
          delete progress.action
          process.events.emit('report-progress', progress)
          break;
      }
    }

    process.events.on('new-work', updateWork)
    process.events.on('work', updateWork)
    process.events.on('stop', () => worker.postMessage({action: 'stop'}))
    process.events.on('close', () => worker.terminate())
  }

  return process;
}
