let jobList = []

function newJob(job) {
  let job = {
    id: job.params[0],
    prevhash: job.params[1],
    coinb1: job.params[2],
    coinb2: job.params[3],
    merkleBranch: job.params[4],
    version: job.params[5],
    nbits: job.params[6],
    ntime: job.params[7],
    cleanJobs: job.params[8]
  }
}

function addJob(job) {
  jobList.push(job)
}

function getJobs() {
  return jobList;
}

function getJobById(id) {
  return jobList.filter(job => (job.id === id))
}

function cleanJobs() {
  jobList = []
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
}
