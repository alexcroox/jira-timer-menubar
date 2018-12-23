import React, { Component } from 'react'
import { remote } from 'electron'
import { ThemeProvider } from 'styled-components'

class ThemeWrapper extends Component {
  constructor (props) {
    super(props)

    this.state = {
      theme: {
        darkMode: false,
        dark: {
          backgroundColor: '#333335',
          color: '#C9C9C9',
          secondaryColor: '#FBFBFB',
          inactiveColor: '#8D8D8D',
          buttonBackground: '#616261',
          inputBackground: '#676767',
          wrapperBackground: '#313131',
          border: '#161616',
          borderLighter: '#484848',
          tableRow: '#2D2D2D',
          tableRowAlt: '#232323',
        }
      }
    }
  }

  componentDidMount () {
    // MacOS dark mode?
    if (process.platform === 'darwin') {
      const { systemPreferences } = remote

      // If enabled before app starts
      let darkMode = systemPreferences.isDarkMode()

      console.log('Dark mode', darkMode)

      this.setState(prevState => ({ ...prevState, theme: { ...prevState.theme, darkMode } }))

      // Listen for dynamic dark mode changes from system preferences
      systemPreferences.subscribeNotification(
        'AppleInterfaceThemeChangedNotification',
        () => {
          darkMode = systemPreferences.isDarkMode()
          console.log('Dark mode switched', darkMode)
          this.setState(prevState => ({ ...prevState, theme: { ...prevState.theme, darkMode } }))
        }
      )
    }
  }

  render () {

    let theme = this.state.theme

    return (
      <ThemeProvider theme={theme}>
        {this.props.children}
      </ThemeProvider>
    )
  }
}


export default ThemeWrapper
