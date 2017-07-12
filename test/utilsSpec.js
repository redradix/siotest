'use strict'

const chai = require('chai')
const should = chai.should()
const Utils = require('../lib/utils')

describe('Utils', function () {
  describe('.max', function () {
    it('returns null if empty array', function () {
      Utils.max([]).should.be.NaN
    })
    it('returns value if just one item in array', function() {
      Utils.max([2]).should.eq(2)
    })
    it('returns the highest value', function() {
      Utils.max([3, 5, 7, 2]).should.eq(7)
    })
    it('processes big arrays', function () {
      let items = []
      for (var i = 200000; i >= 0; i--) {
        items.push(Math.random() * 10)
      }
      Utils.max(items)
    });
  })
})
