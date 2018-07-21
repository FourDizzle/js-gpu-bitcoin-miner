const path = require("path")
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const websocket = require('./websocket')

const createStratumClient = require('./stratum-client')
const jobs = require('./jobs');
const createWork = require('./create-work');

let DIST_DIR = process.env.CLIENT || path.join(__dirname, "/../../client/dist")

let port = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

console.log('Started on port', port)

let stratumSession = createStratumClient('stratum.slushpool.com', 3333)

let routes = require('./routes')(stratumSession, jobs)

app.use(express.static(DIST_DIR))
app.use(routes)

websocket.setup(io)

jobs.onClearJobs((job) => {
  websocket.notifyClearJobs(job, stratumSession)
})

server.listen(port)

stratumSession.onNotify(function(id, prevhash) {
  args = [].slice.call(arguments)
  jobs.addJob(args)
  if (arguments.length === 9 && arguments[8] === true) {
    // websocket.notifyClearJobs()
  }
})

stratumSession.connect(() => {
  stratumSession.subscribe('FourDizzle', () => {
    stratumSession.authorize('FourDizzle.worker1', 'password')
  })
  // stratumSession.authorize('FourDizzle.worker1', 'password',
  //   (error, result) => {
  //     if (!error) {
  //       console.log(result)
  //     } else {
  //       console.log('error:', error)
  //     }
  //   }
  // )
})
