export const movePlayer = (player, direction) => ({
  ...player,
  x: minMax(0, 14, player.x + directionToNumberX(direction)),
  y: minMax(0, 14, player.y + directionToNumberY(direction)),
})

export const minMax = (min, max, val) => Math.min(Math.max(val, min), max)

export const directionToNumberX = arrow => arrow === 'Right' ? 1 : arrow === 'Left' ? -1 : 0

export const directionToNumberY = arrow => arrow === 'Down' ? 1 : arrow === 'Up' ? -1 : 0

export const isConnected = player => player.connected
