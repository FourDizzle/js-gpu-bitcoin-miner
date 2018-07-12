let createStratumClient = require('./stratum-client')
let jobs = require('./jobs');
let createWork = require('./create-work');

var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var websocket = require('./websocket')

var port = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var stratumSession = createStratumClient('stratum.slushpool.com', 3333)

var routes = require('./routes')(stratumSession)
//
// app.use(routes)
// websocket.setup(io)

app.get('/work', (req, res) => {
    console.log("client requested work!");

    let work = createWork(jobs.getJobs()[0], stratumSession)

    res.json({
        result: work,
    });
});

app.listen(port)

// stratumSession.onConnect(() => {
//   stratumSession.subscribe(function() {console.log(arguments)})
//   console.log(stratumSession.respQueue[0])
//   // stratumSession.authorize('FourDizzle.worker1', 'password',
//   //   (error, result) => {
//   //     if (!error) {
//   //       console.log(result)
//   //     } else {
//   //       console.log('error:', error)
//   //     }
//   //   }
//   // )
// })

stratumSession.onNotify(function(id, prevhash) {
  args = [].slice.call(arguments)
  jobs.addJob(args)
  if (arguments.length === 9 && arguments[8] === true) {
    // websocket.notifyClearJobs()
  }
})

stratumSession.connect(() => {
  stratumSession.subscribe('FourDizzle', function() {console.log(arguments)})
  console.log(stratumSession.respQueue[0])
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
