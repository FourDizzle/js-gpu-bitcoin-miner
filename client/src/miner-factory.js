import makeCpuMiner from './cpu-miner'

export default function(minerType) {
  const minerName = 'miner' + Math.floor(Math.random() * 99999)
  return makeCpuMiner(minerName)
}
