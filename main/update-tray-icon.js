import path from 'path'
import { app } from 'electron'
import menubar from './menubar'

const updateTrayIcon = () => {
  let newIcon = null

  // Blue for both dark and light if timer running
  if (!menubar.windowVisible) {
    if (menubar.timerRunning) {
      newIcon = path.join(app.getAppPath(), '/static/tray-timing.png')
    } else {
      // White for dark mode, Grey for light mode if no timer running
      if (menubar.darkMode)
        newIcon = path.join(app.getAppPath(), '/static/tray-white.png')
      else
        newIcon = path.join(app.getAppPath(), '/static/tray-dark.png')
    }
  } else {
    // Window visible
    newIcon = path.join(app.getAppPath(), '/static/tray-white.png')
  }

  if (menubar.currentIcon !== newIcon)
    menubar.handler.tray.setImage(newIcon)

  menubar.currentIcon = newIcon
}

export default updateTrayIcon
