import Immutable from 'seamless-immutable'
import find from 'lodash.find'
import findIndex from 'lodash.findindex'
import StopWatch, { timerList } from '../lib/stopwatch'

// Actions
const ADD_TIMER = 'jt/timer/ADD_TIMER'
const DELETE_TIMER = 'jt/timer/DELETE_TIMER'

const initialState = Immutable({
  list: []
})

// Reducer
export default function reducer (state = initialState, action = {}) {
  switch (action.type) {

    case ADD_TIMER: {
      // We don't want to allow duplicate timers
      let existingTimer = find(state.list, ['id', action.timer.id])

      if (state.list.length < 5 && !existingTimer)
        return state.set('list', [action.timer].concat(state.list))
    }

    case DELETE_TIMER: {
      let timerIndex = findIndex(state.list, ['id', action.timerId])

      if (timerIndex > -1) {
        let list = state.list.asMutable()
        list.splice(timerIndex, 1)
        return state.set('list', Immutable(list))
      }
    }

    default: return state
  }
}

// Action Creators


// Side effects
export const addTimer = (id, key, summary) => dispatch => {
  let stopwatch = new StopWatch(true)

  let timer = {
    id,
    key,
    summary,
    paused: false,
    stopwatchName: stopwatch._name
  }

  timerList.push({ ...timer, stopwatch })

  console.log('New timerList', timerList)

  dispatch({ type: ADD_TIMER, timer })
}


export const deleteTimer = timerId => async dispatch => {

  let matchedTimerIndex = findIndex(timerList, ['id', timerId])

  if (matchedTimerIndex > -1) {
    timerList[matchedTimerIndex].stopwatch.stop()
    timerList.splice(matchedTimerIndex, 1)
  }

  dispatch({
    type: DELETE_TIMER,
    timerId
  })
}
