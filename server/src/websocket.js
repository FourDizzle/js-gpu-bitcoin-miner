const createWork = require('./create-work');

let io

const setup = (socketio, clientList) => {
  io = socketio
  io.on('connection', (client) => {
    console.log('Client connected...')
    clientList.addClient(client)
  })
}

module.exports = {
  setup: setup,
}
