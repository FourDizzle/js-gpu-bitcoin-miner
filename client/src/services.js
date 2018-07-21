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

  service.name = ''

  service.start = () => {
    console.log('start client')
    io = ioClient(url)

    io.on('clear.jobs', (work) => {
      console.log('Clear Jobs!', work)
      updateJobQueue.map(fn => fn(work))
    })

    io.on('name', name => {
      console.log('Recived name:', name)
      service.name = name
    })

    io.on('progress.request', () => {
      console.log('Progress requested')
      requestProgressQ.map(fn => fn())
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
    let body = {
      name: service.name,
      work,
      nonce,
    }
    let options = {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
      },
      method: 'POST',
      body: body,
    }

    fetch(service.url + '/submit', options)
      .then(res => res.json())
      .then((data) => {
        if (typeof callback === 'function') callback(data.result)
        return data
      })
  }

  service.reportProgress = (progress, callback) => {
    console.log('Sending Progress to server.', progress)
    let body = {
      name: service.name,
      progress,
    }
    let options = {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
      },
      method: 'POST',
      body: JSON.stringify(body),
    }

    fetch(service.url + '/report-progress', options)
      .then(res => res.json())
      .then((data) => {
        if (typeof callback === 'function') callback(data.result)
        return data
      })
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
