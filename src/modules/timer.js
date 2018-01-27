import Immutable from 'seamless-immutable'
import find from 'lodash.find'
import findIndex from 'lodash.findindex'

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
export const deleteTimer = timerId => ({
  type: DELETE_TIMER,
  timerId
})


// Side effects
export const addTimer = (id, key, summary) => dispatch => {
  let timer = {
    id,
    key,
    summary,
    started: Date.now()
  }

  dispatch({ type: ADD_TIMER, timer })
}
