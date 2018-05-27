import IO from 'socket.io'
import { movePlayer, isConnected } from './helper'

const io = IO()

const players = []
const sockets = []
const items = []

const playerById = (id) => players.find(_ => _.id === id)

const hydratePlayerSocket = ({socket, playerId}) => ({
  player: playerById(playerId),
  socket,
})

io.on('connection', function(socket){
  console.log('user connected')

  socket.on('disconnect', () => {
    const playerSocket = sockets.find(_ => _.socket === socket)

    if (!playerSocket)
      return

    const player = players.find(_ => _.id === playerSocket.playerId)
    const stringifiedPlayer = JSON.stringify(player)

    console.log('user disconnected', player.id)

    sockets.splice(sockets.indexOf(playerSocket), 1)
    player.connected = false

    const emitUserSignedOff = socket => socket.emit(
      'userSignedOff',
      stringifiedPlayer,
    )

    sockets
      .map(hydratePlayerSocket)
      .filter(_ => _.player.connected)
      .map(_ => _.socket)
      .forEach(emitUserSignedOff)
  })

  socket.on('signIn', id => {
    console.log('signIn', id)

    const signIn = id => {
      const existingPlayer = players.find(player => player.id === id)

      if (existingPlayer) {
        existingPlayer.connected = true
        return existingPlayer
      } else {
        const newPlayer = {
          id,
          x: 0,
          y: 0,
          connected: true,
        }
        players.push(newPlayer)
        return newPlayer
      }
    }

    const player = signIn(id)
    const stringifiedPlayer = JSON.stringify(player)

    socket.emit('signInSuccess', JSON.stringify(players))

    const emitUserSignedIn = socket => socket.emit(
      'userSignedIn',
      stringifiedPlayer,
    )

    sockets
      .filter(isConnected)
      .map(_ => _.socket)
      .forEach(emitUserSignedIn)

    sockets.push({
      playerId: id,
      socket,
    })
  })

  socket.on('move', msg => {
    const json = JSON.parse(msg)
    console.log('move: ', json)
    const player = players.find(player => player.id === json.id)
    if (!player) {
      console.error('ERROR: moving a player that does not exist?', json)
      return
    }
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