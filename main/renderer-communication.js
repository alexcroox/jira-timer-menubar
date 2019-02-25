import { app, ipcMain } from 'electron'
import log from 'electron-log'
import menubar from './menubar'
import worklogs from './jira-worklogs'
import keychain from './keychain'

// IPC communication
class RendererCommunication {
  handleEvents() {
    log.info('Listening for renderer events...')

    // User clicked our custom quit app button
    ipcMain.on('quit', () => {
      app.quit()
    })

    ipcMain.on('windowSizeChange', (event, newHeight) => {
      const [currentWidth] = menubar.handler.window.getSize()

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
      .catch(() => event.sender.send('worklogs', JSON.stringify([])))
    })

    ipcMain.on('openDevTools', () => {
      menubar.handler.window.webContents.openDevTools({ mode: 'detach' })
    })

    ipcMain.on('updateTitle', (event, args) => {
      menubar.updateTitle(event, args)
    })

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
