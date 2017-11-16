module.exports = (function() {
  const _program = require('commander')
  _program
    .option("-d, --debug", "debug")
    .option("-c, --connections <connections>", "the number of connections", parseFloat, 1)
    .option("-n, --number-of-events <numberOfEvents>", "the number of events to send", parseInt, 0)
    .option("--min-interval <minInterval>", "min interval between events", parseInt, 0)
    .option("--max-interval <maxInterval>", "max interval between events", parseFloat, 1)
    .option("-l, --lineal", "lineal execution (no timeouts)")
    .option("-a, --async", "asynchronous")
    .option("-u, --socket-url <socketUrl>", "the endpoint")
    .option("-g, --generator-path <generatorPath>", "the event generator path")
    .option("-o, --output <output>", "output json file path")
    .option("--key-path <keyPath>", "key path")
    .option("--cert-path <certPath>", "cert path")

  return {
    parse
  }

  function parse() {
    _program.parse(process.argv)
    return get()
  }

  function get() {
    return {
      keyPath: _program.keyPath,
      certPath: _program.certPath,
      numberOfEvents: _program.numberOfEvents,
      minInterval: _program.minInterval,
      maxInterval: _program.maxInterval,
      lineal: _program.lineal,
      async: _program.async,
      connections: _program.connections,
      socketUrl: _program.socketUrl,
      generatorPath: _program.generatorPath,
      output: _program.output,
      debug: _program.debug
    }
  }

})()
