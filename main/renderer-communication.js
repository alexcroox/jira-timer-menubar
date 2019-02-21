import { app, ipcMain } from 'electron'
import keychain from 'keytar'
import updateTrayIcon from './update-tray-icon'
import menubar from './menubar'
import keychainService from './keychain-service'
import worklogs from './jira-worklogs'

// IPC communication
class RendererCommunication {
  constructor () {
    this.title = null
    this.jiraUserKey = null
  }

  handleEvents() {

    ipcMain.on('windowSizeChange', (event, newHeight) => {
      const [currentWidth, currentHeight] = menubar.handler.window.getSize()

      menubar.handler.window.setSize(currentWidth, newHeight)
    })

    ipcMain.on('fetchWorklogs', (event, args) => {
      let { userKey } = args

      this.jiraUserKey = userKey

      worklogs.request(userKey)
      .then(worklogs => {
        event.sender.send('worklogs', JSON.stringify({
          worklogs
        }))
      })
      .catch(error => event.sender.send('worklogs', JSON.stringify([])))
    })

    ipcMain.on('deletePassword', (event) => {
      worklogs.getCredentialsFromKeyChain()
        .then(keyChainCredentials => {
          keychain.deletePassword(keyChainService, keyChainCredentials.account)
        })
        .catch(() => log.info('Failed to delete keychain as it doesnt exist'))
    })

    ipcMain.on('openDevTools', event => {
      menubar.handler.window.webContents.openDevTools({ mode: 'detach' })
    })

    ipcMain.on('setPassword', (event, args) => {
      keychain.setPassword(keyChainService, args.jiraDomain, args.authToken)
    })

    ipcMain.on('updateTitle', menubar.updatetitle)

    ipcMain.on('openAtLogin', (event, args) => {
      if (process.env.NODE_ENV !== 'development') {
        app.setLoginItemSettings({
          openAtLogin: args.enabled
        })
      }
    })
  }
}

export default RendererCommunication
