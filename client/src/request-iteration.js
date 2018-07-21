let lastTime = 0

export const requestIteration = function(callback, element) {
  let currTime = (new Date()).getTime()
  let timeToCall = Math.max(0, 16 - (currTime - lastTime))
  let id = setTimeout(function() { callback() }, timeToCall)
  lastTime = currTime + timeToCall
  return id
}

export const cancelIteration = function(id) {
  clearTimeout(id)
}
