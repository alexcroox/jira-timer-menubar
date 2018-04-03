import produce from 'immer'
import find from 'lodash.find'

// Actions
const ADD_TASK = 'jt/recent/ADD_TASK'

const initialState = {
  list: []
}

// Reducer
export default produce(
  (draft, action) => {
    switch (action.type) {

      case ADD_TASK: {
        // We don't want to allow duplicate recents
        let existing = find(draft.list, ['id', action.task.id])

        if (!existing) {
          let newTask = {...action.task}
          newTask.lastPosted = Date.now()
          draft.list.push(newTask)
        } else {
          existing.lastPosted = Date.now()
        }
      }
    }
  }, initialState
)

// Action Creators
export const addRecentTask = task => ({
  type: ADD_TASK,
  task
})
