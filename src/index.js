import log from 'electron-log'

const originalConsoleLog = console.log.bind(console)
console.log = (...args) => {
  log.debug(args)
  originalConsoleLog(...args)
}

window.onerror = (err) => {
  log.error(err)
  originalConsoleLog(...err)
}

import { remote, ipcRenderer } from 'electron'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import store from './lib/create-store'
import api from './lib/api'
import { storeState } from './lib/storage'
import { addWorklogs, setUpdating, fetchWorklogs } from './modules/worklog'
import { setVersion, setUpdateInfo, setDownloaded } from './modules/updater'
import { setAuthToken, setJiraDomain } from './modules/user'
import AppContainer from 'containers/app/app-container'

render(
  <Provider store={store}>
    <MemoryRouter>
      <AppContainer />
    </MemoryRouter>
  </Provider>,
  document.getElementById('root'),
)

let credentials = remote.getCurrentWindow().credentials

if (credentials) {
  store.dispatch(setAuthToken(credentials.password))
  store.dispatch(setJiraDomain(credentials.account))

  api.init(credentials.password, credentials.account)

  // Lets fetch full worklogs on app launch
  store.dispatch(fetchWorklogs(true))
}

console.log('App version', remote.app.getVersion())
store.dispatch(setVersion(remote.app.getVersion()))

// Save our local state to cache file every 60 seconds
setInterval(() => {
  storeState(store.getState())
}, 60000)

// Globally listen out for worklogs coming from main process
ipcRenderer.on('worklogs', (event, worklogPayload) => {
  let payload = JSON.parse(worklogPayload)
  let worklogs = payload.worklogs
  let fullWeek = payload.fullWeek

  console.log('Got worklogs from main process', payload)
  store.dispatch(addWorklogs(worklogs, fullWeek))
  store.dispatch(setUpdating(false))
});

// Request status of the auto update
ipcRenderer.send('updateStatus')

ipcRenderer.on('updateStatus', (event, info) => {
  var updateInfo = JSON.parse(info)
  console.log('updateStatus', updateInfo)
  store.dispatch(setUpdateInfo(updateInfo))
})

ipcRenderer.on('updateReady', () => {
  console.log('updateReady')
  store.dispatch(setDownloaded())
})
