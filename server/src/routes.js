const express = require('express')
const router = express.Router()
const createWork = require('./create-work')

const usageStats = require('./usage-stats')

module.exports = function(stratumSession, jobs, clientList) {
  router.get('/work', (req, res) => {
      console.log("client requested work!");

      let work = createWork(jobs.getJobs()[0], stratumSession)

      res.json({
          result: work,
      });
  });

  router.post('/submit', (req, res) => {
    let body = req.body

    clientList.clients.filter(client => (client.name === body.name))
      .map(client => client.addSubmission('FourDizzle.worker1', body.work, body.nonce))

    let submission = [
      'FourDizzle.worker1',
      body.work.id,
      body.work.extranonce2,
      body.work.nTime,
      body.nonce,
    ]

    let callback = (error, result) => {
      if (error) {
        res.send(error)
        return;
      } else {
        res.send({
          message: 'successfully submitted work for job ' + proof.id
        })
        return;
      }
    }

    submission.push(callback)

    stratumSession.submit.apply(stratumSession, submission)
  })

  router.post('/report-progress', (req, res) => {
    let body = req.body

    clientList.clients.filter(client => (client.name === body.name))
      .map(client => {
        console.log('Updating client:', client.name)
        client.updateProgress(body.progress)
      })

    res.send(true)
  })

  router.get('/stats', (req, res) => {
    res.json({
      result: usageStats.getStats(clientList.clients)
    })
  })

  return router;
}
