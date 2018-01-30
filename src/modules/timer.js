import Immutable from 'seamless-immutable'
import find from 'lodash.find'
import findIndex from 'lodash.findindex'

// Actions
const ADD_TIMER = 'jt/timer/ADD_TIMER'
const DELETE_TIMER = 'jt/timer/DELETE_TIMER'
const PAUSE_TIMER = 'jt/timer/PAUSE_TIMER'

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

    case PAUSE_TIMER: {
      let list = Immutable.asMutable(state.list, {deep: true})
      let timerIndex = findIndex(list, ['id', action.timerId])

      if (timerIndex > -1) {
        let timer = list[timerIndex]
        timer.paused = action.pause

        if (action.pause) {
          timer.endTime = Date.now()
          timer.previouslyElapsed = (Date.now() - timer.startTime) + timer.previouslyElapsed
        } else {
          timer.startTime = Date.now()
        }

        return state.set('list', Immutable(list))
      } else {
        return state
      }
    }

    default: return state
  }
}

// Action Creators
export const deleteTimer = timerId => ({
  type: DELETE_TIMER,
  timerId
})

export const pauseTimer = (timerId, pause) => ({
  type: PAUSE_TIMER,
  timerId,
  pause
})

// Side effects
export const addTimer = (id, key, summary) => dispatch => {
  let timer = {
    id,
    key,
    summary,
    paused: false,
    startTime: Date.now(),
    endTime: null,
    previouslyElapsed: 0
  }

  dispatch({ type: ADD_TIMER, timer })
}
