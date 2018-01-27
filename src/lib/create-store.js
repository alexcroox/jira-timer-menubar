import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware, routerReducer } from 'react-router-redux'
import { memoryHistory } from 'react-router'
import { combineReducers } from 'redux-seamless-immutable'
import Immutable from 'seamless-immutable'
import thunk from 'redux-thunk'
import user from '../modules/user'
import timer from '../modules/timer'

const initialState = Immutable({})
const enhancers = []

const middleware = [
  thunk,
  routerMiddleware(memoryHistory)
]

const reducer = combineReducers({
  user,
  timer,
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
