const miner = require('./miner')
const jobInt = require('./job')

  let job  = jobInt.getJob()
  let result = miner.mine(job)
