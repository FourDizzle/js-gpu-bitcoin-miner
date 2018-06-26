import detectWebGL from './detect-webgl'
import services from './services'
import makeMiner from './miner-factory'

const MINERS = {
  CPU: 'cpu',
  WEBGL_1: 'webgl1',
  WEBGL_2: 'webgl2',
}

let miner = {}
const webgl = detectWebGL()

if (webgl.version === 1) miner = makeMiner(MINERS.WEBGL_1)
else if (webgl.version === 2) miner = makeMiner(MINERS.WEBGL_2)
else miner = makeMiner(MINERS.CPU)

miner.setup()
miner.onRequestWork(function() {})
miner.onSubmit(function(work) {
  console.log('Miner SUBMITS:', work)
})
miner.onProgressReport(function(progress) {
  console.log('Miner REPORTS:', progress)
})

services.getWork(function(work) {
  if (work.error) {
    console.log('Failed to retrieve work')
    console.error(work)
    return;
  }

  miner.start(work)
})
