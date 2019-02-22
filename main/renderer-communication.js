import { app, ipcMain } from 'electron'
import menubar from './menubar'
import worklogs from './jira-worklogs'
import keychain from './keychain'

// IPC communication
class RendererCommunication {

  handleEvents() {
    // User clicked our custom quit app button
    ipcMain.on('quit', () => {
      app.quit()
    })

    ipcMain.on('windowSizeChange', (event, newHeight) => {
      const [currentWidth, currentHeight] = menubar.handler.window.getSize()

      menubar.handler.window.setSize(currentWidth, newHeight)
    })

    ipcMain.on('fetchWorklogs', (event, args) => {
      let { userKey } = args

      keychain.jiraUserKey = userKey

      worklogs.request(userKey)
      .then(worklogs => {
        event.sender.send('worklogs', JSON.stringify({
          worklogs
        }))
      })
      .catch(error => event.sender.send('worklogs', JSON.stringify([])))
    })

    ipcMain.on('openDevTools', event => {
      menubar.handler.window.webContents.openDevTools({ mode: 'detach' })
    })

    ipcMain.on('updateTitle', menubar.updateTitle)

    ipcMain.on('openAtLogin', (event, args) => {
      if (process.env.NODE_ENV !== 'development') {
        app.setLoginItemSettings({
          openAtLogin: args.enabled
        })
      }
    })
  }
}

export default new RendererCommunication()
