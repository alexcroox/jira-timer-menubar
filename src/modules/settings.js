import { ipcRenderer } from 'electron'
import produce from 'immer'
import store from '../lib/create-store'

// Actions
const SET_SINGLE_SETTING = 'jt/settings/SET_SINGLE_SETTING'

const initialState = {
  openAtLogin: false,
  firstLaunch: true,
}

// Reducer
export default produce(
  (draft, action) => {
    switch (action.type) {

      case SET_SINGLE_SETTING:
        draft[action.name] = action.value
    }
  }, initialState
)

// Action Creators
export const setSingleSetting = (name, value) => ({
  type: SET_SINGLE_SETTING,
  name,
  value,
})

// Side effects
export const setFirstLaunchSettings = () => dispatch => {

  let state = store.getState()

  if (state.settings.firstLaunch) {
    dispatch(setSingleSetting('firstLaunch', false))
    dispatch(setOpenAtLogin(true))
  }
}

export const setOpenAtLogin = enabled => dispatch => {

  dispatch(setSingleSetting('openAtLogin', enabled))

  ipcRenderer.send('openAtLogin', {
    enabled
  })
}
