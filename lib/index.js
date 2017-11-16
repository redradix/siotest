#!/usr/bin/env node
var fs = require('fs')
var argsParser = require('./argsParser')
var params = argsParser.parse()
console.info("Params: ", JSON.stringify(params, null, "  "))
var generator = require(`${process.cwd()}/${params.generatorPath}`)
var fakesystem = require('./fakesystem')
var inspector = require('./inspector')({ debug: params.debug })
var system = fakesystem(
  params.socketUrl,
  generator,
  inspector,
  {
    connections: params.connections,
    keyPath: params.keyPath,
    certPath: params.certPath
  }
)
var eventsCount = 0

system.start().then(function(what){
  console.log('Loadtest System started')

  inspector.start()
  if (params.lineal) {
    startLineal()
  } else {
    if(params.async) {
      start()
      console.log('Sending events... Press Ctrl+C to stop.')
    } else {
      startSynchronous()
      console.log('Sending events (one at a time)... Press Ctrl+C to stop.')
    }
  }
})
.catch(function(err){
  console.log('Loadtest System cannot connect to dev server on ' + params.socketUrl + '.\nDid you forget to start it, young Padawan? )')
  console.log(err)
  process.exit()
})

function startLineal() {
  var requests = []
  for(var i = 0; i < params.numberOfEvents; i++) {
    var index = Math.floor(Math.random() * params.connections)
    ++eventsCount
    requests.push(system.sendEvent(index, eventsCount))
  }
  Promise.all(requests)
    .then(printSummary)
    .then(exit)
    .catch(function(err) {
      console.log('Error', err)
    })
}

function start() {
  for(var i = 0; i < params.connections; i++) {
    startSynchronous(i)
  }
}

function startSynchronous(forcedIndex) {
  (function loop() {
    var index = forcedIndex
    if (index === undefined) {
      index = Math.floor(Math.random() * params.connections)
    }
    setTimeout(function() {
      if (!reachedEventsLimit()) {
        ++eventsCount
        system.sendEvent(index, eventsCount)
        .then(function(result){
          loop()
        })
        .catch(function(err){
          console.log('Error sending event', err)
          loop()
        })
      } else {
        system.stopOne(index)
        if (system.allDisconnected()){
          printSummary()
        }
      }
    }, calculateDelay())
  }())
}

function printSummary() {
  console.info("Printing summary...")
  return new Promise((resolve, reject) => {
    var prettySummary = JSON.stringify(inspector.summary(), null, "  ")
    if (!params.output) {
      console.info(prettySummary)
      resolve()
    } else {
      fs.writeFile(params.output, prettySummary, function(err) {
        if (err) {
          console.info("Printing summary... ERROR: ", err)
          reject(err)
        }
        console.info("Printing summary... DONE!")
        resolve()
      })
    }
  })
}

function calculateDelay() {
  var diff = params.maxInterval - params.minInterval
  var delay = params.minInterval
  delay += Math.round(Math.random() * diff)
  return delay
}

function reachedEventsLimit() {
  if (!params.numberOfEvents) return false
  return eventsCount >= params.numberOfEvents
}

process.on('SIGINT', () => {
  printSummary().then(exit)
})

function exit() {
  console.log("Stopping Loadtest System!\n\n")
  process.exit()
}
