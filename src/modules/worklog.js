import { ipcRenderer } from 'electron'
import Immutable from 'seamless-immutable'
import find from 'lodash.find'
import findIndex from 'lodash.findindex'
import parse from 'date-fns/parse'
import isToday from 'date-fns/is_today'
import isThisWeek from 'date-fns/is_this_week'
import isYesterday from 'date-fns/is_yesterday'
import api from '../lib/api'
import { secondsHuman } from '../lib/time'

// Actions
const ADD_WORKLOGS = 'jt/worklog/ADD_WORKLOGS'
const SET_UPDATING = 'jt/worklog/SET_UPDATING'
const SET_DELETING = 'jt/worklog/SET_DELETING'
const DELETE_WORKLOG = 'jt/worklog/DELETE_WORKLOG'

const initialState = Immutable({
  list: [],
  totals: {
    day: 0,
    yesterday: 0,
    week: 0
  },
  updating: false,
  deleted: []
})

// Reducer
export default function reducer (state = initialState, action = {}) {
  switch (action.type) {

    case ADD_WORKLOGS: {

      let dayTotal = 0
      let yesterdayTotal = 0
      let weekTotal = 0

      // We need to keep local track of what we have deleted
      // since the async worklogs could come in just after
      // we've deleted a worklog and re-add it!
      let previouslyDeleted = state.deleted

      action.worklogs.forEach(worklog => {

        if (previouslyDeleted.indexOf(worklog.id) > -1)
          return

        let created = parse(worklog.created)

        if (isToday(created))
          dayTotal += worklog.timeSpentSeconds

        if (isYesterday(created))
          yesterdayTotal += worklog.timeSpentSeconds

        // Week starts on Monday (1)
        if (isThisWeek(created, 1))
          weekTotal += worklog.timeSpentSeconds
      })

      let nextState = state.set('list', Immutable(action.worklogs))
      nextState = nextState.setIn(['totals', 'day'], dayTotal)
      nextState = nextState.setIn(['totals', 'yesterday'], yesterdayTotal)
      nextState = nextState.setIn(['totals', 'week'], weekTotal)

      return nextState
    }

    case SET_UPDATING:
      return state.set('updating', action.updating)

    case SET_DELETING: {
      let list = Immutable.asMutable(state.list, {deep: true})
      let existingWorklog = find(list, ['id', action.worklogId])

      if (existingWorklog) {
        existingWorklog.deleting = action.deleting
        return state.set('list', Immutable(list))
      } else {
        return state
      }
    }

    case DELETE_WORKLOG: {
      let list = Immutable.asMutable(state.list, {deep: true})
      let existingWorklogIndex = findIndex(list, ['id', action.worklogId])

      if (existingWorklogIndex > -1) {
        let nextState = state.set('deleted', [action.worklogId].concat(state.deleted))
        list.splice(existingWorklogIndex, 1)
        return nextState.set('list', Immutable(list))
      } else {
        return state
      }
    }

    default: return state
  }
}

// Action Creators
export const setUpdating = updating => ({
  type: SET_UPDATING,
  updating
})

// Pass array of worklogs
export const addWorklogs = worklogs => ({
  type: ADD_WORKLOGS,
  worklogs
})

// Full week isn't supported yet (need to work on merging states)
export const fetchWorklogs = (fullWeek = true) => async (dispatch, getState) => {

  let state = getState()
  let updating = state.worklog.updating

  if (updating) {
    console.log('Update of worklogs already in progress')
    return
  }

  if (typeof state.user.profile.key === "undefined") {
    console.log('Cant fetch worklogs until we have a user')
    return
  }

  console.log('Requesting worklogs')

  dispatch(setUpdating(true))

  ipcRenderer.send('fetchWorklogs', {
    fullWeek,
    userKey: state.user.profile.key
  })
}

export const deleteWorklog = worklog => async dispatch => {

  if (typeof worklog.id === "undefined")
    return false

  dispatch({
    type: SET_DELETING,
    worklogId: worklog.id,
    deleting: true
  })

  api.delete(`/issue/${worklog.task.key}/worklog/${worklog.id}`)
    .then(response => {

      console.log('Deleted worklog!', worklog)

      dispatch({
        type: DELETE_WORKLOG,
        worklogId: worklog.id
      })

      new Notification(`Worklog deleted`, {
        body: `${secondsHuman(worklog.timeSpentSeconds)} has been removed from ${worklog.task.key}`,
        silent: true
      })
    })
    .catch(error => {
      console.error('Failed to delete worklog', error)

      new Notification(`Failed to delete worklog`, {
        body: `An error occured while deleting time from ${worklog.task.key}`,
      })

      dispatch({
        type: SET_DELETING,
        worklogId: worklog.id,
        deleting: false
      })
    })
}

