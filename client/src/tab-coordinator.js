
const INTERVAL = 60 * 1000
const TOLERANCE = 10 * 1000

let updateId

const refreshClaim = () => {
  let now = (new Date()).getTime()
  window.localStorage.setItem('last.miner.run.time', now)
}

export const executeInOneTabOnly = (callback) => {
  let now = (new Date()).getTime()
  let time = window.localStorage.getItem('last.miner.run.time')
  if (!time || now - time > INTERVAL + TOLERANCE) {
    console.log('first tab to run')
    if (typeof callback === 'function') {
      clearInterval(updateId)
      callback()
      window.localStorage.setItem('last.miner.run.time', now)
      updateId = setInterval(refreshClaim, INTERVAL)
    }
  } else {
    console.log('waiting, instance already running', (new Date()))
    updateId = setTimeout(executeInOneTabOnly.bind(null, callback), INTERVAL)
  }
}

export const releaseClaim = () => {
  clearInterval(updateId)
}
