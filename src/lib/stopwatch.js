// Ripped, modernized and optimised from https://github.com/jasonray/statman-stopwatch/blob/master/lib/Stopwatch.js
import { ipcRenderer } from 'electron'
import store from './create-store'
import now from "performance-now"
import isBoolean from 'lodash.isboolean'
import isEmpty from 'lodash.isempty'
import uuid from 'uuid/v4'
import format from 'string-template'
import timeFormat from 'hh-mm-ss'

const STATES = {
  INIT: 'init',
  RUNNING: 'running',
  STOPPED: 'stopped',
  SPLIT: 'split'
}

// Keep our list of timers here since redux strips away
// the functions attached to stopwatch class :(
export let timerList = []

export const formatSecondsToStopWatch = (seconds, displayFormat = 'hh:mm:ss') => {
  console.log('input', seconds)
  console.log('displayFormat', displayFormat)
  let test = timeFormat.fromS(seconds, displayFormat)
  console.log('output', test)
  return test
}

class Stopwatch {
  constructor(name, autostart) {
    const self = this

    if (isBoolean(name)) {
      autostart = name
      name = null
    }

    if (isEmpty(name)) {
      name = uuid()
    }

    self._name = name

    self.reset()

    if (autostart) this.start()
  }

  name() {
    const self = this
    return self._name
  }

  start() {
    const self = this

    if (self.state() !== STATES.STOPPED && self.state() !== STATES.INIT) {
      throw new Error('Cannot start a stopwatch that is currently running')
    }

    self._state = STATES.RUNNING
    self.startTime = now()
  }

  stop() {
    const self = this
    self.stopTime = now()
    self._state = STATES.STOPPED
    return this.read()
  }

  split() {
    const self = this

    if (self.state() !== STATES.RUNNING) {
      throw new Error('Cannot split time on a stopwatch that is not currently running')
    }

    self.stopTime = now()
    self._state = STATES.SPLIT
    return this.read()
  }

  unsplit() {
    const self = this

    if (self.state() !== STATES.SPLIT) {
      throw new Error('Cannot unsplit time on a stopwatch that is not currently split')
    }

    self.stopTime = null
    self._state = STATES.RUNNING
    return this.read()
  }

  state() {
    return this._state
  }

  reset() {
    const self = this
    self._state = STATES.INIT
    self.startTime = null
    self.stopTime = null
  }

  splitTime() {
    const self = this

    if (self.state() !== STATES.SPLIT) {
      throw new Error('Cannot get split time on a stopwatch that is not currently split')
    }

    const startTime = self.startTime
    const stopTime = self.stopTime
    const delta = calculateDelta(startTime, stopTime)
    return delta

    function calculateDelta(start, end) {
      return end - start
    }
  }

  toString() {
    const self = this
    let template
    template = "[{name} => state:{state} value:{value}]"
    return format(template, { name: self.name(), state: self.state(), value: self.read().toFixed(2) })
  }
}

Stopwatch.prototype.STATES = STATES

Stopwatch.prototype.read = Stopwatch.prototype.time = function() {
  const self = this
  const startTime = self.startTime
  let nowTime
  let delta

  if (startTime) {
    if (self.stopTime) {
      nowTime = self.stopTime
    } else {
      nowTime = now()
    }

    delta = calculateDelta(startTime, nowTime)
  } else {
    nowTime = undefined
    delta = NaN
  }

  return delta

  function calculateDelta(start, end) {
    return end - start
  }
}

export default Stopwatch
