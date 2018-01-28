import React from 'react'
import { Switch, Route } from 'react-router-dom'
import styled, { injectGlobal } from 'styled-components'
import DashboardContainer from '../dashboard/dashboard-container'
import LoginContainer from '../login/login-container'
import { displayTimer } from '../../lib/stopwatch'

// The window needed to be a certain height for the non-js page
// loader to render. Now we've loaded lets allow for smaller window sizes
injectGlobal`
  #root {
    min-height: 50px;
  }
`

const App = () =>  {
  displayTimer.start()

  return (
    <AppWindow>
      <Switch>
        <Route path="/dashboard" component={DashboardContainer} />
        <Route path="/" component={LoginContainer} />
      </Switch>
    </AppWindow>
  )
}

const AppWindow = styled.div`
  border-radius: 6px;
`

export default App
