const io = require('socket.io-client')

module.exports = function(opts, params={}, generator, inspector){
  let sockets = new Array()

  let defaults = {
    transports: ['websocket'],
    forceNew: true
  }

  let defaultParams = {
    connections: 1
  }

  let options = Object.assign({}, defaults, opts)
  let myParams = Object.assign({}, defaultParams, params)

  return {
    start: start,
    stop: stop,
    stopOne: stopOne,
    sendEvent: sendEvent,
    allDisconnected: allDisconnected
  }

  function allDisconnected() {
    return !sockets.length || sockets.every((socket) => socket.disconnected)
  }

  function start() {
    console.info(`Starting ${myParams.connections} sockets...`)
    let promises = new Array()
    for(let i = 0; i < myParams.connections; i++) {
      promises.push(startSingle())
    }
    return Promise.all(promises)
  }

  function startSingle() {
    return new Promise(function(resolve, reject) {
      let socket = io.connect(options.socketUrl, options)
      socket.on('connect', function() {
        resolve({ connected: true, socket: socket})
      })
      socket.on('connect_error', function(err) {
        reject({ connected: false, error: err })
      })
      sockets.push(socket)
    })
  }

  function stop(){
    for(let i = 0; i < params.connections; i++) {
      stopSingle(sockets.pop())
    }
  }

  function stopOne(index){
    return stopSingle(sockets[index])
  }

  function stopSingle(socket) {
    try {
      if(socket){
        socket.disconnect()
        socket = null
      }
    } catch(err) {
      console.log(err)
    }
  }

  function sendEvent(index, eventNumber) {
    return new Promise(function(resolve, reject){
      inspector.startRequest(eventNumber)
      let newEvent = generator.createEvent()
      newEvent.theIndex = eventNumber
      const start = Date.now()
      sockets[index].emit('EVENT:CREATE', newEvent, function(result){
        if(result.success){
          inspector.successRequest(eventNumber)
          resolve(result)
        } else {
          inspector.errorRequest(eventNumber, result)
          reject(result)
        }
      })
    })
  }

}
