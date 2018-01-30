import { ipcRenderer } from 'electron'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import store from './lib/create-store'
import { storeState } from './lib/storage'
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

ipcRenderer.send('refreshPosition')
