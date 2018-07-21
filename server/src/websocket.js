const createWork = require('./create-work');

let io

let clients = []

const setup = (socketio) => {
  io = socketio
  io.on('connection', (client) => {
    console.log('Client connected...')
    clients.push(client)
    client.on('join', (data) => console.log(data))

    client.on('message', (data) => console.log('message from client:', data))
    client.on('disconnect', () => {
      console.log('client disconnected')
      const index = clients.indexOf(client)
      if (index !== -1) clients.splice(index, 1)
    })
  })
}

const clearJobs = (job, session) => {
  clients.forEach(client => {
    client.emit('clear.jobs', createWork(job, session))
  })
}

module.exports = {
  setup: setup,
  notifyClearJobs: clearJobs,
}
