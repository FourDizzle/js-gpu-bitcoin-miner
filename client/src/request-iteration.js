let lastTime

export const requestIteration = function(callback, element) {
  let currTime = (new Date()).getTime()
  let timeToCall = Math.min(0, 16 - (currTime - lastTime))
  let id = setTimeout(function() { callback() }, timeToCall)
  lastTime = currTime + timeToCall
  return id
}

export const cancelIteration = function(id) {
  clearTimeout(id)
}
