import React from 'react'
import { Switch, Route } from 'react-router-dom'
import styled, { injectGlobal } from 'styled-components'
import DashboardContainer from '../dashboard/dashboard-container'
import NewTaskContainer from '../new-task/new-task-container'
import LoginContainer from '../login/login-container'
import WorklogContainer from '../worklog/worklog-container'
import 'react-select/dist/react-select.css'

// The window needed to be a certain height for the non-js page
// loader to render. Now we've loaded lets allow for smaller window sizes
injectGlobal`
  #root {
    min-height: 50px;
  }
  .Select-menu-outer {
    z-index: 999 !important;
  }
  .Select-arrow-zone {
    padding-top: 4px;
  }
`

const App = () =>  {
  return (
    <AppWindow>
      <Switch>
        <Route path="/dashboard" component={DashboardContainer} />
        <Route path="/settings" component={DashboardContainer} />
        <Route path="/create-task" component={NewTaskContainer} />
        <Route path="/worklogs" component={WorklogContainer} />
        <Route path="/" component={LoginContainer} />
      </Switch>
    </AppWindow>
  )
}

const AppWindow = styled.div`
  border-radius: 6px;
`

export default App
