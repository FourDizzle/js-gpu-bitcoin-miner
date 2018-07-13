import makeCpuMiner from './cpu-miner'
import makeWebGlMiner from './webgl/webgl-miner'

export default function(minerType) {
  minerType = 'cpu'
  const minerName = minerType + '-miner-' + Math.floor(Math.random() * 99999)

  switch (minerType) {
    case 'cpu':
      return makeCpuMiner(minerName)
    case 'webgl':
      return makeWebGlMiner(minerName)
    case 'webgl2':
      return makeWebGlMiner(minerName)
  }
}
