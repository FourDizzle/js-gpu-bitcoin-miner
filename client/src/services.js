import ioClient from 'socket.io-client'
const DEFAULT_URL = 'http://localhost:5000'

export default (url) => {
  url = url || DEFAULT_URL
  let service = {
    url: url,
  }

  let io,
  requestProgressQ = [],
  updateJobQueue = []

  service.start = () => {
    console.log('start client')
    io = ioClient(url)

    io.on('clear.jobs', (work) => {
      console.log('Clear Jobs!', work)
      updateJobQueue.map(fn => fn(work))
    })
  }

  service.getWork  = (callback) => {
    fetch(url + '/work')
      .then(res => res.json())
      .then(data => {
        if (typeof callback === 'function') callback(data.result)
        return data
      })
  }

  service.submitWork = (work, nonce, callback) => {
    body = {
      work,
      nonce,
    }
    options = {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
      },
      method: 'POST',
      body: body,
    }

    fetch(BASE_URL + '/submit', options)
      .then(res => res.json())
      .then((data) => {
        if (typeof callback === 'function') callback(data.result)
        return data
      })
  }

  service.reportProgress = (progress, callback) => {

  }

  service.onUpdateJob = (callback) => {
    if (typeof callback === 'function') updateJobQueue.push(callback)
  }

  service.onRequestProgress = (callback) => {
    if (typeof callback === 'function') requestProgressQ.push(callback)
  }

  service.stop = () => {
    io.close()
  }

  return service;
}
