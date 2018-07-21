const config = require("./config")
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const websocket = require('./websocket')

const clientList = require('./clients')
const createStratumClient = require('./stratum-client')
const jobs = require('./jobs');
const createWork = require('./create-work');

let DIST_DIR = config.express.static

let port = config.express.port || 5000;
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

console.log('Started on port', port)

let stratumSession = createStratumClient(config.stratum.url, config.stratum.port)

let routes = require('./routes')(stratumSession, jobs, clientList)

app.use(express.static(DIST_DIR))
app.use(routes)

websocket.setup(io, clientList)

jobs.onClearJobs((job) => {
  clientList.clients.map(client => {
    if (client.connected) {
      client.updateWork(createWork(job, stratumSession))
    }
  })
})

server.listen(port)

stratumSession.onNotify(function(id, prevhash) {
  args = [].slice.call(arguments)
  jobs.addJob(args)
})

stratumSession.connect(() => {
  stratumSession.subscribe(config.stratum.username, () => {
    config.stratum.workers.map(worker => {
      stratumSession.authorize(worker.name, worker.password)
    })
  })
})
