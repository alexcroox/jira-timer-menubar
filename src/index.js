import log from 'electron-log'

const originalConsoleLog = console.log.bind(console)
console.log = (...args) => {
  log.debug(args)
  originalConsoleLog(...args)
}

window.onerror = (err) => {
  log.error(args)
  originalConsoleLog(...args)
}


import { ipcRenderer } from 'electron'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import store from './lib/create-store'
import { storeState } from './lib/storage'
import { addWorklogs, setUpdating, fetchWorklogs } from './modules/worklog'
import AppContainer from 'containers/app/app-container'

render(
  <Provider store={store}>
    <MemoryRouter>
      <AppContainer />
    </MemoryRouter>
  </Provider>,
  document.getElementById('root'),
);

setInterval(() => {
  storeState(store.getState())
}, 60000)

// We need to keep the window position synced under the icon
ipcRenderer.send('refreshPosition')

store.dispatch(fetchWorklogs(true))

// Globally listen out for worklogs coming from main process
ipcRenderer.on('worklogs', (event, worklogJson) => {

  let worklogs = JSON.parse(worklogJson)
  console.log('Got worklogs from main process', worklogs.length)
  store.dispatch(addWorklogs(worklogs))
  store.dispatch(setUpdating(false))
});
