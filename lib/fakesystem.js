var io = require('socket.io-client')
var fs = require('fs')

module.exports = function(socketUrl, generator, inspector, opts){
  var sockets = new Array()
  var connections = opts.connections || 1
  var key = opts.keyPath? fs.readFileSync(opts.keyPath): false
  var cert = opts.certPath? fs.readFileSync(opts.certPath): false

  var options = {
    transports: ['websocket'],
    forceNew: true,
    rejectUnauthorized: false
  }

  if (key) {
    options.key = key
  }

  if (cert) {
    options.cert = cert
  }

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
    console.info(`Starting ${connections} sockets...`)
    var promises = new Array()
    for(var i = 0; i < connections; i++) {
      promises.push(startSingle())
    }
    return Promise.all(promises)
  }

  function startSingle() {
    return new Promise(function(resolve, reject) {
      var socket = io.connect(socketUrl, options)
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
    for(var i = 0; i < connections; i++) {
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
      var newEvent = generator.createEvent()
      newEvent.theIndex = eventNumber
      var start = Date.now()
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
