import Worker from './cpu-miner.worker.js'

let work
let worker
let submitCb
let progressReportCb
let requestWorkCb

const submit = function(work, nonce) {
  if (typeof submitCb === 'function') submitCb({ work: work, nonce: nonce})
}
const reportProgress = function(work, nonce, numhashes, duration) {
  if (typeof progressReportCb === 'function')
    progressReportCb({
      work: work,
      nonce: nonce,
      numhashes: numhashes,
      duration: duration,
    })
}
const requestWork = function() {
  if (typeof requestWorkCb === 'function')
    requestWorkCb(update)
}

const setup = function(options) {
  worker = new Worker();
  worker.onmessage = (e.data) => {
    const message = e.data
    if (message.action === 'submit') {
      submit(message.work, message.nonce)
    } else if (message.action === 'report') {
      reportProgress(message.work, message.nonce, message.numhashes, message.duration)
    } else if (message.action === 'requestWork') {
      requestWork()
    }
  }
}

const start = function(work) {
  worker.postMessage({
    action: 'work',
    work: work,
  })
}

const update = function(work) {}
const stop = function() {}
const close = function() {
  worker.terminate()
}

const onRequestWork = function(callback) {
  requestWorkCb = callback
}
const onSubmit = function(callback) {
  submitCb = callback
}
const onProgressReport = function(callback) {
  progressReportCb = callback
}
