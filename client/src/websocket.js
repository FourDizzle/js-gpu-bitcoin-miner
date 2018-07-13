import ioClient from 'socket.io-client'

console.log('start client')
let io = ioClient('http://localhost:5000')

io.on('clear.jobs', () => console.log('Clear Jobs!'))
