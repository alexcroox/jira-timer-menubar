// CommonJS for Node :(

const { app, ipcMain } = require('electron')
const log = require('electron-log')
const menubar = require('menubar')
const keychain = require('keytar-prebuild')
const path = require('path')
const delay = require('delay')
const JiraWorklogs = require('./jira-worklogs')
const Updater = require('./auto-updater')
const keyChainService = (process.env.NODE_ENV !== 'development') ? 'jira-timer-mb' : 'jira-timer-mb-dev'
const Worklogs = new JiraWorklogs(keyChainService)

log.transports.console.level = 'info'

log.info(app.getName())
log.info(app.getVersion())
console.log(app.getName(), app.getVersion())

// Start event handling for the auto updater
const autoUpdater = new Updater(log)
autoUpdater.handleEvents()

// resolve user $PATH env variable
require('fix-path')()

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')({ showDevTools: true })
}

const installExtensions = () => {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Installing dev extensions')

      const installer = require('electron-devtools-installer')

      const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']
      const forceDownload = !!process.env.UPGRADE_EXTENSIONS

      Promise.all(
        extensions.map(name => installer.default(installer[name], forceDownload)),
      ).then(() => resolve()).catch(console.log)
    } else {
      return resolve()
    }
  })
}

// Set to start at login. TODO: Use auto-launch to allow user to
// configure this in settings
// https://github.com/zulip/zulip-electron/blob/68acf2ec643b78223ea89fdc5dbc77ffabdb3541/app/main/startup.js
if (process.env.NODE_ENV !== 'development') {
  app.setLoginItemSettings({
    openAtLogin: true
  })
}

let fetchingWorklogs = false
let willQuitApp = false
let updateAvailable = false
let mb = null
let credentials = null

Worklogs.getCredentialsFromKeyChain()
  .then(keyChainCredentials => {
    credentials = keyChainCredentials
    launchMenuBar()
  })
  .catch(launchMenuBar)

function launchMenuBar () {
  app.on('ready', () => {

    installExtensions()

    // transparency workaround https://github.com/electron/electron/issues/2170
    setTimeout(() => {

      mb = menubar({
        alwaysOnTop: process.env.NODE_ENV === 'development',
        icon: path.join(app.getAppPath(), '/static/tray-dark.png'),
        width: 500,
        minWidth: 500,
        maxWidth: 500,
        minHeight: 530,
        hasShadow: false,
        preloadWindow: true,
        resizable: true,
        transparent: true,
        frame: false,
        toolbar: false
      })

      mb.window.credentials = credentials

      mb.on('ready', () => {
        console.log('Menubar ready')
        mb.tray.setTitle(' Login')
      })

      mb.on('show', () => {
        mb.tray.setImage(path.join(app.getAppPath(), '/static/tray-dark-active.png'))
      })

      mb.on('hide', () => {
        mb.tray.setImage(path.join(app.getAppPath(), '/static/tray-dark.png'))
      })
    }, 100)
  })
}

app.on('before-quit', () => willQuitApp = true)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ipc communication
ipcMain.on('quit', () => {
  app.quit()
})

ipcMain.on('openDevTools', (event) => {
  mb.window.webContents.openDevTools()
})

ipcMain.on('updateTitle', (event, title) => {
  mb.tray.setTitle(` ${title}`)
})

ipcMain.on('setPassword', (event, args) => {
  keychain.setPassword(keyChainService, args.jiraDomain, args.authToken)
})

ipcMain.on('deletePassword', (event) => {
  Worklogs.getCredentialsFromKeyChain()
    .then(keyChainCredentials => {
      keychain.deletePassword(keyChainService, keyChainCredentials.account)
    })
    .catch(() => console.log('Failed to delete keychain as it doesnt exist'))
})

ipcMain.on('fetchWorklogs', (event, args) => {

  let { userKey, fullWeek } = args

  if (fetchingWorklogs) {
    console.log('Already fetching worklogs, request denied')
    return
  }

  fetchingWorklogs = true

  let executionStart = Date.now()

  Worklogs.fetchMine(userKey, fullWeek)
    .then(worklogs => {
      fetchingWorklogs = false
      let executionSeconds = Math.round((Date.now() - executionStart) / 1000)
      console.log('Fetched worklogs', worklogs.length, `Took: ${executionSeconds} seconds`)

      event.sender.send('worklogs', JSON.stringify({
        fullWeek,
        worklogs
      }))
    })
    .catch(error => {
      console.log('Failed to fetch worklogs', error)
      event.sender.send('worklogs', JSON.stringify([]))
    })
})
