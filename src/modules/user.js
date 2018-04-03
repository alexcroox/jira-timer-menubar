import produce from 'immer'
import api from '../lib/api'
import { ipcRenderer } from 'electron'
import { push } from 'react-router-redux'

// Actions
const USER_LOGIN = 'jt/user/USER_LOGIN'
const USER_LOGIN_RESPONSE = 'jt/user/USER_LOGIN_RESPONSE'
const USER_LOGOUT = 'jt/user/USER_LOGOUT'
const USER_SET_AUTH_TOKEN = 'jt/user/USER_SET_AUTH_TOKEN'
const USER_SET_PROFILE = 'jt/user/USER_SET_PROFILE'
const USER_SET_JIRA_DOMAIN = 'jt/user/USER_SET_JIRA_DOMAIN'

const initialState = {
  loginPending: false,
  loginError: false,
  authToken: null,
  jiraDomain: null,
  profile: {},
}

// Reducer
export default produce(
  (draft, action) => {
    switch (action.type) {

      case USER_LOGIN:
        draft.loginPending = true

      case USER_LOGIN_RESPONSE: {
        draft.loginPending = false

        if (action.status === 'success')
          draft.loginError = initialState.loginError
        else
          draft.loginError = action.error
      }

      case USER_LOGOUT: {
        ipcRenderer.send('updateTitle', 'Login')
        draft.authToken = null
      }

      case USER_SET_AUTH_TOKEN: {
        ipcRenderer.send('updateTitle', 'Idle')
        draft.authToken = action.token
      }

      case USER_SET_PROFILE:
        draft.profile = action.profile

      case USER_SET_JIRA_DOMAIN:
        draft.jiraDomain = action.jiraDomain
    }
  }, initialState
)

// Action Creators
export const userLoginResponse = (status, error) => ({
  type: USER_LOGIN_RESPONSE,
  status,
  error,
})

export const setAuthToken = token => ({
  type: USER_SET_AUTH_TOKEN,
  token
})

export const setProfile = profile => ({
  type: USER_SET_PROFILE,
  profile
})

export const setJiraDomain = jiraDomain => ({
  type: USER_SET_JIRA_DOMAIN,
  jiraDomain
})

export const isLoggedIn = state =>
  state.accessToken


// Side effects
export const userLogin = (username, password, authUrl) => async dispatch => {
  dispatch({ type: USER_LOGIN })

  api.login(username, password, authUrl)
    .then(response => {
      dispatch(userLoginResponse('success', null))
    })
    .catch(error => {
      console.log('error logging in', error)
      dispatch(userLoginResponse('error', true))
    })
}

export const userLogout = () => dispatch => {
  api.logout()
  dispatch({ type: USER_LOGOUT })
}
