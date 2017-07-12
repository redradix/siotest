const Utils = require('./utils')

const SUCCESS = 'success'
const ERROR = 'error'

module.exports = function(opts) {

  const defaultOpts = {
    debug: false
  }

  const _opts = Object.assign({}, defaultOpts, opts)

  let _start
  let _requests = {}

  return {
    start,
    summary,
    startRequest,
    successRequest,
    errorRequest
  }

  function startRequest(eventNumber) {
    _requests[eventNumber] = { start: Date.now(), id: eventNumber }
  }

  function successRequest(eventNumber) {
    finishRequest(eventNumber, SUCCESS)
  }

  function errorRequest(eventNumber) {
    finishRequest(eventNumber, ERROR)
  }

  function finishRequest(eventNumber, status) {
    _requests[eventNumber].end = Date.now()
    _requests[eventNumber].status = status
  }

  function summary() {
    let summary = {}
    summary.startedAt = new Date(_start).toLocaleString()
    summary.requests = {
      total: requestsCount(),
      success: successRequestsCount(),
      error: errorRequestsCount(),
    }
    summary.latency = {
      average: averageLatency(),
      max: maxLatency(),
      min: minLatency()
    }
    const now = Date.now()
    summary.exitedAt = new Date(now).toLocaleString()
    summary.duration = Utils.formatDuration(now - _start)

    if (_opts.debug) {
      summary.requests.items = requestsData().map((request) => {
        return Object.assign(
          {},
          request,
          { duration: Utils.formatDuration(request.end - request.start) }
        )
      })
      summary.noseque = groupByStart()
    }

    return summary
  }

  function groupByStart() {
    const key = 'start'
    return requestsData().reduce((acc, request) => {
      if (!acc[request[key]]) acc[request[key]] = 0
      acc[request[key]]++
      return acc
    }, {})
  }

  function averageLatency() {
    const latencies = calculateLatencies()
    return Utils.average(latencies)
  }

  function maxLatency() {
    const latencies = calculateLatencies()
    return Utils.max(latencies)
  }

  function minLatency() {
    const latencies = calculateLatencies()
    return Utils.min(latencies)
  }

  function calculateLatencies() {
    const latencies = requestKeys()
      .map(calculateLatency)
      .filter(notALatency)
    return latencies
  }

  function notALatency(value) {
    return !isNaN(value)
  }

  function calculateLatency(ev) {
    const request = getRequest(ev)
    return request.end - request.start
  }

  function successRequestsCount() {
    return requestsData().filter((item) => item.status === SUCCESS).length
  }

  function errorRequestsCount() {
    return requestsData().filter((item) => item.status === ERROR).length
  }

  function requestsData() {
    return requestKeys().map(getRequest)
  }

  function requestsCount() {
    return requestKeys().length
  }

  function getRequest(id) {
    return Object.assign(_requests[id])
  }

  function start() {
    _start = Date.now()
  }

  function requestKeys() {
    return Object.keys(_requests)
  }

}

