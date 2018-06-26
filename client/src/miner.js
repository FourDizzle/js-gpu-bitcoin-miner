const setup = function(options) {
  this.process = {};
  this.process.interuptMessage = function() {}
}

const start = function(work) {
  this.currentWork = work
  this.process.interuptMessage({
    action: 'work',
    work: work,
  })
}

const update = function(work) {}
const stop = function() {
  console.log('stopping', this.name)
  this.process.interuptMessage({
    action: 'stop'
  })
}
const close = function() {
  this.worker.terminate()
}

const onRequestWork = function(callback) {
  this.requestWorkCb = callback
}
const onSubmit = function(callback) {
  this.submitCb = callback
}
const onProgressReport = function(callback) {
  this.progressReportCb = callback
}

export default {
    name,
    setup,
    start,
    update,
    stop,
    close,
    onRequestWork,
    onSubmit,
    onProgressReport,
};
