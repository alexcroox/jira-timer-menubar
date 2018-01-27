import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import store from './lib/create-store'
import AppContainer from 'containers/app/app-container'
import { ipcRenderer } from 'electron'

render(
  <Provider store={store}>
    <MemoryRouter>
      <AppContainer />
    </MemoryRouter>
  </Provider>,
  document.getElementById('root'),
);

ipcRenderer.send('refreshPosition')
