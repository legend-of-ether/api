const IO = require('socket.io')

const io = IO()

const players = []
const sockets = []

io.on('connection', function(socket){
  console.log('user connected')

  socket.on('signIn', id => {
    console.log('signIn', id)

    const player = players.find(player => player.id === id)

    if (!player) {
      const newPlayer = {
        id,
        x: 0,
        y: 0,
      }
      players.push(newPlayer)
    }

    socket.emit('signInSuccess', JSON.stringify(players))

    sockets.forEach(
      socket => socket.socket.emit(
        'userSignedIn',
        JSON.stringify(players.find(_ => _.id === id))
      )
    )

    sockets.push({
      playerId: id,
      socket,
    })
  })

  socket.on('move', msg => {
    const json = JSON.parse(msg)
    console.log('move: ', json)
    const player = players.find(player => player.id === json.id)
    const movedPlayer = movePlayer(player, json.direction)
    player.x = movedPlayer.x
    player.y = movedPlayer.y
    console.log('moved player', movedPlayer)

    sockets.filter(_ => _.playerId !== movedPlayer.id).forEach(
      socket => socket.socket.emit(
        'updatePlayerPosition',
        JSON.stringify(movedPlayer)
      )
    )

  })
})

io.listen(process.env.PORT || 3000)

function movePlayer(player, direction) {
  return {
    ...player,
    x: minMax(0, 14, player.x + directionToNumberX(direction)),
    y: minMax(0, 14, player.y + directionToNumberY(direction)),
  }
}

const minMax = (min, max, val) => Math.min(Math.max(val, min), max)

const directionToNumberX = arrow => arrow === 'Right' ? 1 : arrow === 'Left' ? -1 : 0

const directionToNumberY = arrow => arrow === 'Down' ? 1 : arrow === 'Up' ? -1 : 0
