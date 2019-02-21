import { app, ipcMain } from 'electron'
import log from 'electron-log'
import menubar from 'menubar'
import path from 'path'
import url from 'url'
import worklogs from './jira-worklogs'

log.transports.file.level = 'silly'
log.transports.console.level = 'silly'

log.info(app.getName())
log.info(app.getVersion())
log.info(app.getName(), app.getVersion())

// Resolve user $PATH env variable
require('fix-path')()

if (process.env.NODE_ENV === 'development')
  require('electron-debug')({ showDevTools: true })

const installExtensions = () => {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'development') {
      log.info('Installing dev extensions')

      const installer = require('electron-devtools-installer')

      const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']
      const forceDownload = !!process.env.UPGRADE_EXTENSIONS

      Promise.all(
        extensions.map(name => installer.default(installer[name], forceDownload))
      ).then(() => resolve()).catch(log.info)
    } else {
      return resolve()
    }
  })
}

let mb = null
let renderProcess = null
let awaitingDeepLinkTaskKey = null
let credentials = null
let jiraUserKey = null
let windowVisible = false
let darkMode = false
let currentIcon = path.join(app.getAppPath(), '/static/tray-dark.png')

// Register deep link protocol
app.setAsDefaultProtocolClient('jiratimer')

app.on('ready', () => {
  installExtensions()

  // Get our keychain credentials and launch menu bar on success or failure
  worklogs.getCredentialsFromKeyChain()
    .then(keyChainCredentials => {
      credentials = keyChainCredentials
      log.info('Credentials ready')
      menubar.delayedLaunch()
    })
    .catch(menubar.delayedLaunch)
})



const launchMenuBar = () => {


}

ipcMain.on('quit', () => {
  app.quit()
})

// Protocol handler for osx
app.on('open-url', (e, deepLinkRawUrl) => {
  e.preventDefault()

  let deepLinkUrl = url.parse(deepLinkRawUrl)
  log.info('Deep link', JSON.stringify({ deepLinkUrl }))

  // This event is called immediately when deep linking
  // The app may not yet be ready so we need to fire the
  // renderProcess message later
  if (renderProcess)
    sendCreateTimerMessage(deepLinkUrl.path)
  else
    awaitingDeepLinkTaskKey = deepLinkUrl.path
})

const sendCreateTimerMessage = taskKey => {
  awaitingDeepLinkTaskKey = null

  renderProcess.send('create-timer', JSON.stringify({
    taskKey
  }))

  mb.showWindow()
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
