import Store from 'electron-store'
import produce from 'immer'
import { initialState } from '../modules/updater'

const storage = new Store()

// Save redux state to local file
export const persistMiddleware = ({ getState }) => next => action => {
  // Get the state after the action was performed
  next(action)
  let latestState = getState()
  storeState(latestState)
}

export const storeState = (currentState) => {

  const next = produce(currentState, function() {
    // We need to null the authToken as we store this in secure keychain
    this.user.authToken = null

    // If we quit the app while updating worklogs
    // we want to be able to fetch them next time we load
    this.worklog.updating = false

    this.updater = initialState
  })

  storage.set('redux', next)
}

export default storage
