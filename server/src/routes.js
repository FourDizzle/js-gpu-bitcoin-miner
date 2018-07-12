const express = require('express')
const router = express.Router()
const createWork = require('./create-work')
const jobs = require('./jobs')

module.exports = function(stratumSession, jobs) {
  router.get('/work', (req, res) => {
      console.log("client requested work!");

      let work = createWork(jobs.getJobs()[0], stratumSession)

      res.json({
          result: work,
      });
  });

  router.post('/submit', (req, res) => {
    let body = req.body

    let submission = [
      'FourDizzle.worker1',
      body.work.id,
      body.work.extranonce2,
      body.work.nTime,
      body.nonce,
    ]

    stratumSession.submit.apply(
      stratumSession, submission, (error, result) => {
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
    )
  })

  router.post('/report', (req, res) => {
    console.log(req.body)
    res.send(true)
  })

  return router;
}
