var net = require('net');
var events = require('events');

let eventEmitter = new events.EventEmitter();

let respQueue = []

let respBuf = []
let messageId = 0

var client

function parseMsg(msg) {
  let parsed = '';
  try {
    parsed = JSON.parse(msg)
  } catch (error) {
    // log ERROR
    console.error(error, msg)
  }
  return parsed
}

function handleMsg(msg) {
  if (msg.id !== null && typeof msg.id === 'number' && respQueue[msg.id]) {
    fn = respQueue[msg.id]
    fn(msg)
    delete respQueue[msg.id]
  } else if (msg.method) {
    console.log('Recieved:', JSON.stringify(msg))
    eventEmitter.emit(msg.method, msg)
  }
}

function handleResp(data) {
  let datatext = new String(data);
  let messages = datatext.split('\n');

  if (respBuf.length) {
    messages[0] = respBuf.pop() + messages[0]
  }

  respBuf.push(messages.pop())

  messages.map(msg => {
    let parsed = parseMsg(msg)
    if (parsed) handleMsg(parsed)
  })
}

function addRespQueue(id, fn) {
  respQueue[id] = fn;
}

function sendMessage(method, params, callback) {
  messageId++
  message = {}
  message.id = messageId
  message.method = method
  message.params = params || []
  if (typeof callback === 'function') addRespQueue(messageId, callback)
  var msgTxt = JSON.stringify(message) + '\n'
  console.log('Sending:', msgTxt)
  client.write(msgTxt)
}

function reset() {
  client = new net.Socket();
  respQueue = []
  respBuf = []
  messageId = 0

  client.on('data', function(data) {
    handleResp(data)
  })

  client.on('close', function() {
  	console.log('Connection closed');
    reset()
  })
}

function connect(port, host, callback) {
  reset()
  client.connect(port, host, callback)
}

module.exports = {
  connect: connect,
  sendMessage: sendMessage,
  on: eventEmitter.on,
}
