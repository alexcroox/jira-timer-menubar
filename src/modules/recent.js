import Immutable from 'seamless-immutable'
import find from 'lodash.find'

// Actions
const ADD_TASK = 'jt/recent/ADD_TASK'

const initialState = Immutable({
  list: []
})

// Reducer
export default function reducer (state = initialState, action = {}) {
  switch (action.type) {

    case ADD_TASK: {
      // We don't want to allow duplicate recents
      let existing = find(state.list, ['id', action.task.id])

      if (!existing)
        return state.set('list', [action.task].concat(state.list))
    }

    default: return state
  }
}

// Action Creators
export const addRecentTask = task => ({
  type: ADD_TASK,
  task
})
