// import detectWebGL from './detect-webgl'
// import * as services from './services'
// import makeMiner from './miner-factory'

// import websocket from './websocket'

import makeMiner from './cpu/cpu-miner'
import makeService from './services'

// let miner = makeMiner()
// miner.setup()
//
// miner.updateWork(testWork)

let makeWorker = (options) => {
  options = options || {}
  options.url = options.url || window.location.origin
  options.minerType = 'cpu'

  let service = makeService(options.url)
  let miner = makeMiner()
  miner.setup(options)

  let worker = {
    miner: miner,
    connection: service,
  }

  miner.onSubmit(service.submitWork)
  service.onRequestProgress(miner.getProgress)
  miner.onProgressReport(service.reportProgress)
  service.onUpdateJob(miner.updateWork)

  worker.start = () => {
    service.start()
    service.getWork(miner.start)
  }

  worker.stop = () => {
    service.stop()
    miner.stop()
  }

  return worker;
}

export default makeWorker

let worker = makeWorker()
worker.start()
// let miner = {}
// const webgl = detectWebGL()

// console.log(webgl)

// miner = makeMiner(webgl)
// miner = makeMiner(services)
//
// miner.setup({threads: 1000, debug: true})
// miner.start()
// miner.onRequestWork(function() {
//   services.getWorkStub(miner.update)
// })
// miner.onSubmit(function(work) {
//   console.log('Miner SUBMITS:', work)
// })
// miner.onProgressReport(function(progress) {
//   console.log('Miner REPORTS:', progress)
// })
//
// services.getWorkStub(function(work) {
//   if (work.error) {
//     console.log('Failed to retrieve work')
//     console.error(work)
//     return;
//   }
//
//   miner.start(work)
// })

window.startMiner = worker.start
window.stopMiner = worker.stop
