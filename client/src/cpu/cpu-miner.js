const Emitter = require('tiny-emitter')
import Worker from './cpu-miner.worker.js'

const addToQueue = (queue, callback) => {
  if (typeof callback === 'function') {
    queue.add(callback)
  }
}

export default (events) => {
  events = events || new Emitter()
  let miner = { eventEmitter: events }
  let worker
  let progressQueue = []
  let submitQueue = []
  let finishedQueue = []

  let submit = (submission) => {
    events.emit('submit', submission)
    submitQueue.map(fn => fn(submission))
  }

  let reportProgress = (report) => {
    events.emit('report-progress', report)
    progressQueue.map(fn => fn(report))
    progressQueue = []
  }

  let alertFinished = (work) => {
    events.emit('finished-work', work)
    finishedQueue.map(fn => fn(work))
  }

  miner.setup = (options) => {
    worker = new Worker();
    worker.onmessage = (e) => {
      let msg = e.data
      switch (msg.action) {
        case 'submit':
          submit(msg.data)
          break;
        case 'report-progress':
          reportProgress(msg.data)
          break;
        case 'finished-work':
          alertFinished(msg.data)
          break;
      }
    }

    events.on('new-work', miner.updateWork)
    events.on('stop', miner.stop)
    events.on('close', miner.close)
    events.on('request-progress', () => miner.getProgress())
  }

  miner.start = (work) => {
    miner.updateWork(work)
  }

  miner.updateWork = (work) => {
    miner.work = work
    worker.postMessage({action: 'work', data: work})
  }

  miner.getProgress = (callback) => {
    addToQueue(progressQueue, callback)
    worker.postMessage({action: 'request-progress'})
  }

  miner.onSubmit = (callback) => {
    addToQueue(submitQueue, callback)
  }

  miner.onFinishedWork = (callback) => {
    addToQueue(finishedQueue, callback)
  }

  miner.stop = () => {
    worker.postMessage({action: 'stop'})
  }

  miner.close = () => {
    worker.terminate()
  }

  return miner;
}
