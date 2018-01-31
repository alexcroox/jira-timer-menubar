import { ipcRenderer } from 'electron'
import Immutable from 'seamless-immutable'
import find from 'lodash.find'

// Actions
const ADD_WORKLOG = 'jt/worklog/ADD_WORKLOG'
const SET_UPDATING = 'jt/worklog/SET_UPDATING'

const initialState = Immutable({
  list: [],
  updating: false
})

// Reducer
export default function reducer (state = initialState, action = {}) {
  switch (action.type) {

    case ADD_WORKLOG: {
      if (Array.isArray(action.worklog))
        return state.set('list', Immutable(action.worklog))
      else
        return state.set('list', [action.worklog].concat(state.list))
    }

    case SET_UPDATING:
      return state.set('updating', action.updating)

    default: return state
  }
}

// Action Creators
export const setUpdating = updating => ({
  type: SET_UPDATING,
  updating
})

// Can pass a single object to be added to the end of the list
// or an array to replace the list entirely
export const addWorklog = worklog => ({
  type: ADD_WORKLOG,
  worklog
})

export const fetchWorklogs = (username, password, authUrl) => (dispatch, getState) => {

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

  ipcRenderer.send('fetchWorklogs', state.user.profile.key)
}

