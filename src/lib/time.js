import timeFormat from 'hh-mm-ss'
import humanTime from 'pretty-ms'
import store from './create-store'

export const formatSecondsToStopWatch = (seconds, displayFormat = 'hh:mm:ss') => {
  return timeFormat.fromS(seconds, displayFormat)
}

export const roundToNearestMinutes = (seconds, forceMinuteRounding = false) => {
  let state = store.getState()

  let roundNearestMinute = (!forceMinuteRounding) ? state.settings.roundNearestMinute : forceMinuteRounding

  let minutes = Math.ceil(seconds / 60)

  if (roundNearestMinute === 0)
    return minutes

  return (roundNearestMinute * Math.ceil(minutes / roundNearestMinute))
}

export const secondsHuman = seconds => {

  if (!seconds)
    return '0h'

  return humanTime(seconds * 1000)
}
