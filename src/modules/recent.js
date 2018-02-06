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
      let list = Immutable.asMutable(state.list, {deep: true})
      let existing = find(list, ['id', action.task.id])

      if (!existing) {
        let newTask = {...action.task}
        newTask.lastPosted = Date.now()
        list.push(newTask)
      } else {
        existing.lastPosted = Date.now()
      }

      return state.set('list', Immutable(list))
    }

    default: return state
  }
}

// Action Creators
export const addRecentTask = task => ({
  type: ADD_TASK,
  task
})
