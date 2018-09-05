// CommonJS for Node :(

const { app, ipcMain, Menu } = require('electron')
const log = require('electron-log')
const menubar = require('menubar')
const keychain = require('keytar-prebuild')
const path = require('path')
const delay = require('delay')
const JiraWorklogs = require('./jira-worklogs')
const Updater = require('./auto-updater')
const keyChainService = (process.env.NODE_ENV !== 'development') ? 'jira-timer-mb' : 'jira-timer-mb-dev'
const Worklogs = new JiraWorklogs(keyChainService)

log.transports.file.level = 'debug'
log.transports.console.level = 'debug'

log.info(app.getName())
log.info(app.getVersion())
console.log(app.getName(), app.getVersion())

// resolve user $PATH env variable
require('fix-path')()

if (process.env.NODE_ENV === 'development')
  require('electron-debug')({ showDevTools: true })

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

let mb = null
let credentials = null
let jiraUserKey = null

Worklogs.getCredentialsFromKeyChain()
  .then(keyChainCredentials => {
    credentials = keyChainCredentials
    launchMenuBar()
  })
  .catch(launchMenuBar)

function launchMenuBar () {
  app.on('ready', () => {

    const menu = Menu.buildFromTemplate([
      {
        label: 'Edit',
        submenu: [
          {role: 'undo'},
          {role: 'redo'},
          {type: 'separator'},
          {role: 'cut'},
          {role: 'copy'},
          {role: 'paste'},
          {role: 'pasteandmatchstyle'},
          {role: 'delete'},
          {role: 'selectall'}
        ]
      }
    ])

    Menu.setApplicationMenu(menu)

    installExtensions()

    // transparency workaround https://github.com/electron/electron/issues/2170
    setTimeout(() => {

      mb = menubar({
        alwaysOnTop: process.env.NODE_ENV === 'development',
        icon: path.join(app.getAppPath(), '/static/tray-dark.png'),
        width: 500,
        minWidth: 500,
        maxWidth: 500,
        minHeight: 560,
        hasShadow: false,
        preloadWindow: true,
        resizable: true,
        useContentSize: true,
        transparent: true,
        frame: false,
        toolbar: false
      })

      mb.window.credentials = credentials

      // Start event handling for the auto updater
      const autoUpdater = new Updater(mb.window.webContents, log)
      autoUpdater.handleEvents()

      mb.on('ready', () => {
        console.log('Menubar ready')
        mb.tray.setTitle(' Login')
      })

      mb.on('show', () => {
        mb.tray.setImage(path.join(app.getAppPath(), '/static/tray-dark-active.png'))

        if (jiraUserKey) {

          let renderProcess = mb.window.webContents

          Worklogs.checkLock(true)
            .then(() => {
              console.log('Telling render process we are fetching worklogs')
              renderProcess.send('fetchingWorklogs')

              let fullWeek = false

              Worklogs.request(jiraUserKey, fullWeek, true)
                .then(worklogs => {
                  console.log('All good', worklogs.length)
                  renderProcess.send('worklogs', JSON.stringify({
                    fullWeek,
                    worklogs
                  }))
                })
                .catch(error => {
                  console.error('Error fetching worklogs', error)
                  renderProcess.send('worklogs', JSON.stringify([]))
                })
            })
            .catch(error => {
              console.error('Error checking worklog lock')
              renderProcess.send('worklogs', JSON.stringify([]))
            })
        }
      })

      mb.on('hide', () => {
        mb.tray.setImage(path.join(app.getAppPath(), '/static/tray-dark.png'))
      })
    }, 100)
  })
}

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

  jiraUserKey = userKey

  Worklogs.request(userKey, fullWeek)
    .then(worklogs => {
      event.sender.send('worklogs', JSON.stringify({
        fullWeek,
        worklogs
      }))
    })
    .catch(error => event.sender.send('worklogs', JSON.stringify([])))
})

ipcMain.on('openAtLogin', (event, args) => {
  if (process.env.NODE_ENV !== 'development') {
    app.setLoginItemSettings({
      openAtLogin: args.enabled
    })
  }
})
