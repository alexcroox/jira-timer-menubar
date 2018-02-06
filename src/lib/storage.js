import Store from 'electron-store'
import Immutable from 'seamless-immutable'
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
  let mutableState = Immutable.asMutable(currentState, {deep: true})

  // We need to null the authToken as we store this in secure keychain
  mutableState.user.authToken = null

  // If we quit the app while updating worklogs
  // we want to be able to fetch them next time we load
  mutableState.worklog.updating = false

  mutableState.update = initialState

  storage.set('redux', mutableState)
}

export default storage
