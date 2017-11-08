'use strict'

module.exports = {
  formatDuration: dhm,
  average: average,
  max: max,
  min: min
}

function max(items) {
  if (!items.length) return NaN
  if (items.length === 1) return items[0]
  return items.reduce((acc, item) => Math.max(acc, item), 0)
}

function min(items) {
  if (!items.length) return NaN
  if (items.length === 1) return items[0]
  return items.reduce((acc, item) => Math.min(acc, item), items[0])
}

function average(items) {
  var sum = items.reduce(function(previous, current) {
    return current += previous
  }, 0);
  var avg = sum / items.length;
  return Math.floor(avg);
}

function dhm(t){
    var cd = 24 * 60 * 60 * 1000,
        ch = 60 * 60 * 1000,
        cm = 60 * 1000
        cms = 1000
        d = Math.floor(t / cd),
        h = Math.floor( (t - d * cd) / ch),
        m = Math.floor( (t - d * cd - h * ch) / cm),
        s = Math.floor( (t - d * cd - h * ch - m * cm) / cms),
        ms = t - d * cd - h * ch - m * cm - s * cms;
  if( ms === 1000 ){
    s++;
    ms = 0;
  }
  if( s === 60 ){
    m++;
    s = 0;
  }
  if( m === 60 ){
    h++;
    m = 0;
  }
  if( h === 24 ){
    d++;
    h = 0;
  }
  return `${d}d ${h}h ${m}m ${s}s ${ms} ms`;
}
