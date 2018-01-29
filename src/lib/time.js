import timeFormat from 'hh-mm-ss'

export const formatSecondsToStopWatch = (seconds, displayFormat = 'hh:mm:ss') => {
  return timeFormat.fromS(seconds, displayFormat)
}
