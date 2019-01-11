import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware, routerReducer } from 'react-router-redux'
import { memoryHistory } from 'react-router'
import { combineReducers } from 'redux-seamless-immutable'
import Immutable from 'seamless-immutable'
import objectGet from 'object-get'
import storage, { persistMiddleware } from './storage'
import thunk from 'redux-thunk'
import user from '../modules/user'
import timer from '../modules/timer'
import recent from '../modules/recent'
import worklog from '../modules/worklog'
import updater from '../modules/updater'
import settings from '../modules/settings'

let initialState = (storage.get('redux')) ? storage.get('redux') : { settings: {} }
const enhancers = []

// New roundNearestMinute setting
let existingRoundNearestMinute = objectGet(initialState, 'settings.roundNearestMinute')
if (existingRoundNearestMinute === undefined)
  initialState.settings.roundNearestMinute = 15

initialState = Immutable(initialState)

const middleware = [
  thunk,
  persistMiddleware,
  routerMiddleware(memoryHistory)
]

const reducer = combineReducers({
  updater,
  user,
  timer,
  recent,
  worklog,
  settings,
  router: routerReducer,
})

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension())
  }
}

const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers
)

const store = createStore(
  reducer,
  initialState,
  composedEnhancers
)

export default store
