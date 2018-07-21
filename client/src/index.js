import makeMiner from './cpu/cpu-miner'
import makeService from './services'
import { executeInOneTabOnly, releaseClaim } from './tab-coordinator'

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

  worker.start = executeInOneTabOnly.bind(null, () => {
    service.start()
    service.getWork(miner.start)
  })

  // worker.start = () => {
  //   service.start()
  //   service.getWork(miner.start)
  // }

  worker.stop = () => {
    releaseClaim()
    service.stop()
    miner.stop()
  }

  return worker;
}

export default makeWorker

// remove when finished dev
let worker = makeWorker()
worker.start()
window.startMiner = worker.start
window.stopMiner = worker.stop
