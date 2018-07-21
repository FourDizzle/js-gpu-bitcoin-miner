const uuid = require('uuid/v4')

let clients = []

const addClient = (socket) => {
  let client = {
    name: uuid(),
    socket,
    address: socket.handshake.address,
    work: {},
    progress: {},
    submissions: [],
    connected: true,
  }

  let intervalId

  const disconnect = () => {
    clearInterval(intervalId)
    clearTimeout(intervalId)
    client.stopTime = new Date()
    client.connected = false
    socket.disconnect()
    cleanUp()
  }

  client.startTime = new Date()

  socket.on('disconnect', disconnect)

  let progressQ = []

  client.updateWork = (work) => {
    client.work = work
    socket.emit('clear.jobs', work)
  }

  client.getProgress = (callback) => {
    if (typeof callback === 'function') progressQ.push(callback)
    socket.emit('progress.request')
  }

  client.updateProgress = (progress) => {
    client.progress = progress
    if (progress.work) client.work = progress.work

    progressQ.map(fn => fn(progress))
    progressQ = []
  }

  client.addSubmission = (miner, work, nonce) => {
    client.submissions.push({
      time: new Date(),
      miner,
      work,
      nonce,
    })
  }

  client.close = () => {
    socket.emit('stop')
    disconnect()
  }

  client.socket.emit('name', client.name)

  intervalId = setTimeout(() => {
    client.getProgress()
    intervalId = setInterval(client.getProgress, 30000)
  }, 10000)

  clients.push(client)
}

const cleanUp = () => {
  clients = clients.filter(client => (client && !!client.connected))
}

module.exports = {
  addClient,
  clients,
  cleanUp,
}
