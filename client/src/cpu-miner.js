import Worker from './cpu-miner.worker.js'
import miner from './miner.js'

const setup = function(options) {
  this.process = new Worker();
  this.process.interuptMessage = this.process.postMessage
  this.process.onmessage = (e) => {
    const message = e.data
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
        lastHash: message.lastHash,
      })
    } else if (message.action === 'requestWork' && typeof this.requestWorkCb === 'function') {
      this.requestWorkCb()
    }
  }
}

export default function(name) {
  let cpuMiner = { setup }
  Object.setPrototypeOf(cpuMiner, miner)
  return cpuMiner
}
