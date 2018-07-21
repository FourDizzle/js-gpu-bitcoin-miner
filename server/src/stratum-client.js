const net = require('net');
const events = require('events');
const uuid = require('uuid/v4')

const DEFAULT_SHARE_TARGET =
  0x00000000ffff0000000000000000000000000000000000000000000000000000

function calcTarget(difficulty) {
  target = DEFAULT_SHARE_TARGET / difficulty
  targetString = target.toString(16)
  padSize = 64 - targetString.length

  for (let i = 0; i < padSize; i++) {
    targetString = '0' + targetString
  }

  return targetString;
}

function parseMsg(msg) {
  let parsed = '';
  try {
    parsed = JSON.parse(msg)
  } catch (error) {
    // log ERROR
    // console.error(error, msg)
  }
  return parsed
}

function handleMsg(msg) {
  if (msg.id !== null) {
    let error = msg.error || null
    let result = msg.result || null

    this.respQueue = this.respQueue.map(cb => {
      if (cb.id === msg.id) {
        cb.fn(error, result)
      } else {
        return cb;
      }
    }).filter(cb => !!cb)
  }

  if (msg.method) {
    // console.log('Recieved:', JSON.stringify(msg))
    this.eventEmitter.emit(msg.method, msg)
  }
}

function handleResp(data) {
  let datatext = new String(data);

  let messages = datatext.split('\n');
  let firstMessage = messages[0];
  if (this.respBuf.length) {
    messages[0] = this.respBuf.pop() + firstMessage
  }

  // after splitting, last message is either \n or an incomplete messages
  this.respBuf.push(messages.pop())

  messages.map((msg, i) => {
    let parsed = parseMsg(msg)
    if (parsed) {
      console.log('Received:', msg)
      handleMsg.call(this, parsed)
    } else if (i === 0 && (parsed = parseMsg(firstMessage))) {
      console.log('Received:', firstMessage)
      handleMsg.call(this, parsed)
    } else {
      //error parsing
    }
  })
}

function addRespQueue(id, fn) {
  respObj  = { id: id, fn: fn }
  this.respQueue.push(respObj);
}

function sendMessage(method, params, callback) {
  message = {}
  message.id = Math.floor(Math.random() * 1000)
  message.method = method
  message.params = params || []

  if (typeof callback === 'function') {
    addRespQueue.call(this, message.id, callback)
  }

  var msgTxt = JSON.stringify(message) + '\n'
  this.eventEmitter.emit('socket.sendingMessage', message)
  console.log('Sending:', msgTxt)
  this.socket.write(msgTxt)
}

function makeAction(method) {
  return function() {
    let callback, args = [].slice.call(arguments)
    if (args.length > 0 && typeof args[args.length - 1] === 'function') {
      callback = args.pop()
    } else {
      callback = null
    }

    this.sendMessage(method, args, callback)
  };
}

function reset() {
  this.socket = new net.Socket();
  this.respQueue = []
  this.respBuf = []
  this.host = ''

  this.socket.on('data', function(data) {
    handleResp(data)
  })

  this.socket.on('close', function() {
  	console.log('Connection closed');
    reset()
    this.eventEmitter.emit('client.disconnected')
  })
}

function connect(callback) {
  this.socket.on('data', (data) => {
    handleResp.call(this, data)
  })

  this.socket.on('close', function() {
  	console.log('Connection closed');
    reset()
    this.eventEmitter.emit('client.disconnected')
  })

  this.socket.connect(this.port, this.host, () => {
    if (typeof callback === 'function') callback()
    this.eventEmitter.emit('client.connect')
  })
}

function isReconnectHostSame(curHost, curPort, hostname, port) {
  return (currHost.toLowerCase() === hostname.toLowerCase()
    && curPort === port);
}

function reconnect(hostname, port, waitTime) {
  if (isReconnectHostSame(this.host, this.port, hostname, port)) {
    this.eventEmitter.once('client.disconnected', () => {
      setTimeout(this.connect(port, hostname), waitTime * 1000)
    })
    this.socket.end()
  } else {
    console.log('Reconnect host (' + hostname + ':' + port +
      ') different from original (' + this.host + ':' + this.socket.port + ')')
  }
}

function onServerMsg(method, callback) {
  if (typeof callback === 'function') {
    this.eventEmitter.on(method, (msg) => {
      let params = msg.params || []
      // console.log('params', params)
      callback.apply(null, params)
    })
  }
}

function onConnect(callback) {
  this.eventEmitter.on('client.connect', callback)
}

module.exports = (host, port, options) => {
  let defaultTarget = calcTarget(1)
  let eventEmitter = new events.EventEmitter()

  let client = {
    host,
    port,
    socket: new net.Socket(),
    eventEmitter: eventEmitter,
    respQueue: [],
    respBuf: [],
    extranonce1: null,
    extranonce2Size: null,
    shareDifficulty: 1,
    shareTarget: defaultTarget,
  }
  client.onEvent = client.eventEmitter.on
  client.connect = connect.bind(client)

  client.onConnect = onConnect.bind(client)

  client.sendMessage = sendMessage.bind(client)

  client.authorize = makeAction.call(client, 'mining.authorize')
  client.capabilities = makeAction.call(client, 'mining.capabilities')
  client.extranonceSubscribe =
    makeAction.call(client, 'mining.extranonce.subscribe'),
  client.getTransactions = makeAction.call(client, 'mining.get_transactions')
  client.submit = makeAction.call(client, 'mining.submit')
  client.subscribe = makeAction.call(client, 'mining.subscribe')
  client.suggestDifficulty =
    makeAction.call(client, 'mining.suggest_difficulty')

  client.onGetVersion = onServerMsg.bind(client, 'client.get_version')
  client.onReconnect = onServerMsg.bind(client, 'client.reconnect')
  client.onShowMessage = onServerMsg.bind(client, 'client.show_message')
  client.onNotify = onServerMsg.bind(client, 'mining.notify')
  client.onSetDifficulty = onServerMsg.bind(client, 'mining.set_difficulty')
  client.onSetExtranonce =  onServerMsg.bind(client, 'mining.set_extranonce')

  onServerMsg.call(client, 'client.reconnect', reconnect)

  client.eventEmitter.on('socket.sendingMessage', (msg) => {
    if (msg.method === 'mining.subscribe') {
      let fn = (error, result) => {
        client.extranonce1 = result[1]
        client.extranonce2Size = result[2]
      }
      addRespQueue.call(client, msg.id, fn)
    }
  })

  client.onSetDifficulty((difficulty) => {
    client.shareDifficulty = difficulty
    client.shareTarget = calcTarget(difficulty)
  })

  return client;
}
