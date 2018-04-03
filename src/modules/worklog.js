import { ipcRenderer } from 'electron'
import produce from 'immer'
import find from 'lodash.find'
import findIndex from 'lodash.findindex'
import objectGet from 'object-get'
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
const UPDATE_TIME = 'jt/worklog/UPDATE_TIME'
const SET_UPDATING_WORKLOG = 'jt/worklog/SET_UPDATING_WORKLOG'

const initialState = {
  list: [],
  totals: {
    day: 0,
    yesterday: 0,
    week: 0
  },
  updating: false,
  updatingWorklog: null,
  deleted: []
}

// Reducer
export default produce(
  (draft, action) => {
    switch (action.type) {

      case ADD_WORKLOGS: {

        let dayTotal = 0
        let yesterdayTotal = 0
        let weekTotal = 0

        // We need to keep local track of what we have deleted
        // since the async worklogs could come in just after
        // we've deleted a worklog and re-add it!
        let previouslyDeleted = draft.deleted

        if (typeof previouslyDeleted === "undefined")
          previouslyDeleted = []

        let currentWorklogs = draft.list
        let workLogs = action.worklogs

        // If we are sending less than the full week lets add to the array if new
        // or update existing time if duplicate
        if (!action.fullRefresh) {
          action.worklogs.forEach(worklog => {
            let existingWorklog = find(draft.list, ['id', worklog.id])

            if (existingWorklog) {
              existingWorklog.timeSpentSeconds = worklog.timeSpentSeconds
            } else {
              draft.list.push(worklog)
            }
          })

          // Now loop through all existing worklogs, delete any that aren't present in passed
          // worklogs that are from the same day
          draft.list.forEach((worklog, index) => {
            let created = parse(worklog.created)

            if (isToday(created)) {
              let matchingWorklog = find(action.worklogs, ['id', worklog.id])

              if (!matchingWorklog)
                draft.list.splice(index, 1)
            }
          })
        }

        draft.list.forEach(worklog => {

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

        draft.totals.day = dayTotal
        draft.totals.yesterday = yesterdayTotal
        draft.totals.week = weekTotal
      }

      case SET_UPDATING:
        draft.updating = action.updating

      case SET_DELETING: {
        let existingWorklog = find(draft.list, ['id', action.worklogId])

        if (existingWorklog)
          existingWorklog.deleting = action.deleting
      }

      case DELETE_WORKLOG: {
        let existingWorklogIndex = findIndex(draft.list, ['id', action.worklogId])

        if (typeof draft.deleted === "undefined")
          draft.deleted = []

        if (existingWorklogIndex > -1) {
          draft.deleted = [action.worklogId].concat(draft.deleted)
          draft.list.splice(existingWorklogIndex, 1)
        }
      }

      case SET_UPDATING_WORKLOG:
        draft.updatingWorklog = action.worklogId

      case UPDATE_TIME: {
        let existingWorklog = find(draft.list, ['id', action.worklogId])

        if (existingWorklog)
          existingWorklog.timeSpentSeconds = action.timeSpentSeconds
      }
    }
  }, initialState
)

// Action Creators
export const setUpdating = updating => ({
  type: SET_UPDATING,
  updating
})

// Pass array of worklogs
export const addWorklogs = (worklogs, fullRefresh) => ({
  type: ADD_WORKLOGS,
  worklogs,
  fullRefresh
})

export const setNewTime = (worklogId, timeSpentSeconds) => ({
  type: UPDATE_TIME,
  worklogId,
  timeSpentSeconds
})

export const setUpdatingWorklog = worklogId => ({
  type: SET_UPDATING_WORKLOG,
  worklogId
})

export const fetchWorklogs = (fullWeek = true) => async (dispatch, getState) => {

  let state = getState()
  let updating = state.worklog.updating

  if (updating) {
    console.log('Update of worklogs already in progress')
    return
  }

  let userKey = objectGet(state, 'user.profile.key')

  if (!userKey) {
    console.log('Cant fetch worklogs until we have a user')
    return
  }

  console.log('Requesting worklogs')

  dispatch(setUpdating(true))

  ipcRenderer.send('fetchWorklogs', {
    fullWeek,
    userKey
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

export const updateWorkLogTime = (worklog, timeSpentSeconds) => async dispatch => {

  if (typeof worklog.id === "undefined")
    return false

  console.log('timeSpentSeconds', timeSpentSeconds)

  dispatch(setUpdatingWorklog(worklog.id))

  api.put(`/issue/${worklog.task.key}/worklog/${worklog.id}`, {
    timeSpentSeconds
  })
    .then(response => {

      console.log('Updated worklog time', worklog)

      dispatch(setUpdatingWorklog(null))
      dispatch(setNewTime(worklog.id, timeSpentSeconds))
      dispatch(fetchWorklogs(false))

      new Notification(`Worklog time updated`, {
        body: `The workog for ${worklog.task.key} has changed time to ${secondsHuman(timeSpentSeconds)}`,
        silent: true
      })
    })
    .catch(error => {
      console.error('Failed to update worklog time', error)

      new Notification(`Failed to update worklog time`, {
        body: `An error occured while updating time for ${worklog.task.key}`,
      })

      dispatch(setUpdatingWorklog(null))
    })
}

