let stratumClient = require('./stratum-client')
let jobs = require('./jobs');
let work = require('./work');

var express = require('express')
var app = express()
var bodyParser = require('body-parser')

var port = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var stratumSession = {
  port: 3333,
  host: 'stratum.slushpool.com',
}

app.listen(port)

app.get('/work', function(req, res) {
    console.log("client requested work!");

    let work = work.createWork(jobs.getJobs()[0], stratumSession)

    res.json({
        result: work,
    });
});

stratumClient.connect(stratumSession.port, stratumSession.host, () => {
  console.log('Connected to', stratumSession.host)
  stratumClient.sendMessage('mining.subscribe', [], (msg) => {
    console.log(JSON.stringify(msg))
    if (msg.error === null) {
      msg.result[0].forEach(sessVar => {
        if (sessVar[0] === 'mining.set_difficulty')
          stratumSession.setDifficulty = sessVar[1]
        else if (sessVar[0] === 'mining.notify')
          stratumSession.notify = sessVar[1]
      })
      stratumSession.extranonce1 = msg.result[1]
      stratumSession.extranonce2Size = msg.result[2]
    }

    client.sendMessage('mining.authorize', ["FourDizzle.worker1", "password"], function(msg) {
      console.log(JSON.stringify(msg))
    })
  })
})

stratumClient.on('mining.set_difficulty', msg => {
  stratumSession.setDifficulty = msg.params[0]
})

stratumClient.on('mining.notify', msg => {
  jobs.updateJobs(msg)
  //notify clients if cleanJobs is run
})
