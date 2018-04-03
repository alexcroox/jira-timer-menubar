import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { routerMiddleware, routerReducer } from 'react-router-redux'
import { memoryHistory } from 'react-router'
import storage, { persistMiddleware } from './storage'
import thunk from 'redux-thunk'
import user from '../modules/user'
import timer from '../modules/timer'
import recent from '../modules/recent'
import worklog from '../modules/worklog'
import updater from '../modules/updater'
import settings from '../modules/settings'

const initialState = storage.get('redux')
const enhancers = []

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
  const devToolsExtension = window.devToolsExtension

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
