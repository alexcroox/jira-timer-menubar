import React, { Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'
import ThemeWrapper from './theme-wrapper'
import DashboardContainer from '../dashboard/dashboard-container'
import NewTaskContainer from '../new-task/new-task-container'
import LoginContainer from '../login/login-container'
import WorklogContainer from '../worklog/worklog-container'
import SettingsContainer from '../settings/settings-container'
import 'react-select/dist/react-select.css'

// The window needed to be a certain height for the non-js page
// loader to render. Now we've loaded lets allow for smaller window sizes
const GlobalStyle = createGlobalStyle`
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

// The top arrow only makes sense on macOS
if (process.platform !== 'darwin') {
  injectGlobal`
    .tray-triangle {
      display: none;
    }
  `
}

const App = () =>  {
  return (
    <AppWindow>
      <GlobalStyle />
      <ThemeWrapper>
        <Fragment>
          <WindowTriangle />
          <Switch>
            <Route path="/dashboard" component={DashboardContainer} />
            <Route path="/settings" component={SettingsContainer} />
            <Route path="/create-task" component={NewTaskContainer} />
            <Route path="/worklogs" component={WorklogContainer} />
            <Route path="/" component={LoginContainer} />
          </Switch>
        </Fragment>
      </ThemeWrapper>
    </AppWindow>
  )
}

const AppWindow = styled.div`
  border-radius: 6px;
`

const WindowTriangle = styled.div`
  width: 29px;
  height: 15px;
  position: absolute;
  overflow: hidden;
  box-shadow: 0 16px 10px -17px rgba(0, 0, 0, 0.5);
  left: 50%;
  transform: translateX(-50%);
  top: -15px;
  z-index: 11;

  &:after {
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    background: ${props => props.theme.darkMode ? props.theme.darkBackground : '#FFF' };
    transform: rotate(45deg);
    top: 9px;
    left: 5px;
    box-shadow: -1px -1px 10px -2px rgba(0, 0, 0, 0.5);
  }
`

export default App
