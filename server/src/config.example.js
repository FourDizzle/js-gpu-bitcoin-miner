/**
*
*   RENAME TO config.js and fill in real values
*
**/

const path = require("path")
const env = process.env.NODE_ENV

const dev = {
  express: {
    port: 5000,
    static: path.join(__dirname, "/../../client/dist"),
  },
  stratum: {
    url: 'theinternet.com',
    port: 3333,
    username: 'blahblah',
    miners: [
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
    miners: [
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
