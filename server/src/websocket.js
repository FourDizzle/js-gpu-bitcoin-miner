let io

let clients = []

const setup = (socketio) => {
  io = socketio
  io.on('connection', (client) => {
    console.log('Client connected...')

    client.on('join', (data) => console.log(data))

    client.on('message', (data) => console.log('message from client:', data))
    client.on('disconnect', () => console.log('client disconnected'))
  })
}

const clearJobs = () => {
  io.emit('clear.jobs')
}

module.exports = {
  setup: setup,
  notifyClearJobs: clearJobs,
}
