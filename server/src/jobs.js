const events = require('events')

const eventEmitter = new events.EventEmitter()

let jobList = []

function newJob(job) {
  return {
    id: job[0],
    prevhash: job[1],
    coinb1: job[2],
    coinb2: job[3],
    merkleBranch: job[4],
    version: job[5],
    nbits: job[6],
    ntime: job[7],
    cleanJobs: job[8]
  };
}

function isJob(obj) {
  return (
    obj.id
    && obj.prevhash
    && obj.coinb1
    && obj.coinb2
    && obj.merkleBranch
    && obj.version
    && obj.nbits
    && obj.ntime
  );
}

function addJob(job) {
  let parsedJob
  if (Array.isArray(job)) {
    parsedJob = newJob(job)
  } else if (isJob(job)) {
    parsedJob = job
  }

  if (parsedJob.cleanJobs) {
    cleanJobs()
  }

  jobList.push(parsedJob)
}

function getJobs() {
  return jobList;
}

function getJobById(id) {
  return jobList.filter(job => (job.id === id))
}

function cleanJobs() {
  jobList = []
  eventEmitter.emit('clearJobs')
}

function updateJobs(msg) {
  let job = newJob(msg)
  // if (job.cleanJobs) cleanJobs()
  addJob(job)
}

module.exports = {
  updateJobs: updateJobs,
  addJob: addJob,
  getJobs: getJobs,
  getJobById: getJobById,
  cleanJobs: cleanJobs,
  onClearJobs: function(callback) {
    eventEmitter.on('clearJobs', callback)
  }
}
