import Immutable from 'seamless-immutable'
import find from 'lodash.find'
import findIndex from 'lodash.findindex'
import api from '../lib/api'
import { addRecentTask } from './recent'
import { fetchWorklogs } from './worklog'
import { roundToNearestMinutes, secondsHuman } from '../lib/time'
import format from 'date-fns/format'

// Actions
const ADD_TIMER = 'jt/timer/ADD_TIMER'
const DELETE_TIMER = 'jt/timer/DELETE_TIMER'
const PAUSE_TIMER = 'jt/timer/PAUSE_TIMER'
const POST_TIMER = 'jt/timer/POST_TIMER'

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

    case POST_TIMER: {
      let list = Immutable.asMutable(state.list, {deep: true})
      let timerIndex = findIndex(list, ['id', action.timerId])

      if (timerIndex > -1) {
        let timer = list[timerIndex]
        timer.posting = action.posting

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

export const postingTimer = (timerId, posting) => ({
  type: POST_TIMER,
  timerId,
  posting
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

export const postTimer = stateTimer => async (dispatch, getState) => {

  // Pause timer and save current elapsed time against timer
  dispatch(pauseTimer(stateTimer.id, true))
  dispatch(postingTimer(stateTimer.id, true))

  // We need the state after the above dispatches
  process.nextTick(() => {

    let timers = getState().timer.list

    let timer = find(timers, ['id', stateTimer.id])

    if (!timer)
      return

    let seconds = Math.round(timer.previouslyElapsed / 1000)
    let nearestMinutes = roundToNearestMinutes(seconds)
    let humanTime = secondsHuman(nearestMinutes * 60)

    api.post(`/issue/${timer.key}/worklog`, {
      timeSpent: `${nearestMinutes}m`,
      started: format(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSSZZ')
    })
      .then(worklog => {
        console.log('Saved worklog', worklog)
        dispatch(deleteTimer(timer.id))

        new Notification(`${humanTime} posted`, {
          body: `Your time for ${timer.key} has been posted to JIRA`
        })

        // Save to recents
        dispatch(addRecentTask(timer))
        dispatch(fetchWorklogs())
      })
      .catch(error => {
        console.log('Error posting timer', error)
        dispatch(postingTimer(timer.id, false))

        new Notification('Error posting timer', {
          body: `Timer ${timer.key} failed to send, please try again`
        })
      })
    })
}
