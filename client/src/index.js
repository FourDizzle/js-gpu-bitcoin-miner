// import detectWebGL from './detect-webgl'
import * as services from './services'
import makeMiner from './miner-factory'

import websocket from './websocket'

let miner = {}
// const webgl = detectWebGL()

// console.log(webgl)

// miner = makeMiner(webgl)
miner = makeMiner(services)

miner.setup({threads: 1000, debug: true})
miner.start()
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

window.startMiner = miner.start.bind(miner)
window.stopMiner = miner.stop.bind(miner)
