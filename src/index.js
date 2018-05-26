const IO = require('socket.io')

const io = IO()

const players = []

io.on('connection', function(socket){
  console.log('user connected')

  socket.on('signIn', id => {
    console.log('signIn:', id)
  })

  socket.on('onKeyDown', msg => {
    console.log('message: ' + msg)
  })
})

io.listen(3000)