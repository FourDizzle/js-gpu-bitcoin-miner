/**
*
*   RENAME TO config.js and fill in real values
*
**/

const path = require("path")
const env = process.env.NODE_ENV

env = (env === 'dev' || env === 'prod') ? env : 'dev'

const dev = {
  express: {
    port: 5000,
    static: path.join(__dirname, "/../../client/dist"),
  },
  stratum: {
    url: 'theinternet.com',
    port: 3333,
    username: 'blahblah',
    workers: [
      {
        name: 'blahblah.worker1',
        password: 'password',
      },
    ]
  }
}

const prod = {
  express: {
    port: 80,
    static: '',
  },
  stratum: {
    url: 'theinternet.com',
    port: 3333,
    username: 'blahblah',
    workers: [
      {
        name: 'blahblah.worker1',
        password: 'password',
      },
    ]
  }
}

const config = {
  dev,
  prod,
}

module.exports = config[env]
