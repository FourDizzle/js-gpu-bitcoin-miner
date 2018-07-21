// import detectWebGL from './detect-webgl'
// import * as services from './services'
// import makeMiner from './miner-factory'

// import websocket from './websocket'

import makeMiner from './cpu/cpu-miner'

let miner = makeMiner()
miner.setup()

let testWork = {
  id:'00000001',
  extranonce2: '00000001',
  nTime: '53058b35',
  target: '00000000000000015f5300000000000000000000000000000000000000000000',
  data: '00000002975b9717f7d18ec1f2ad55e2559b5997b8da0e3317c8037800000001000000005a29978af1b447278d94b3a0440399f3a69fe1c03a2bb9b2bae6c819871714dc53058b3519015f5300000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000080020000',
  midstate: 'dc6a3b8d0c69421acb1a5434e536f7d5c3c1b9e44cbb9b8f95f0172efc48d2df',
  hash1: '00000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000100',
  nonceStart: 854000000,
  nonceEnd: 0xffffffff,
}

miner.updateWork(testWork)

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

window.startMiner = miner.start.bind(miner)
window.stopMiner = miner.stop.bind(miner)
