import timeFormat from 'hh-mm-ss'
import humanTime from 'pretty-ms'

export const formatSecondsToStopWatch = (seconds, displayFormat = 'hh:mm:ss') => {
  return timeFormat.fromS(seconds, displayFormat)
}

// Eventualy make this part of settings
export const roundToNearestMinutes = (seconds, nearestMinute = 15) => {
  let minutes = Math.ceil(seconds / 60)
  return (nearestMinute * Math.ceil(minutes / nearestMinute))
}

export const secondsHuman = seconds => {

  if (!seconds)
    return '0h'

  return humanTime(seconds * 1000)
}
