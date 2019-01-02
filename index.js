// CommonJS for Node :(

const { app, ipcMain, Menu, systemPreferences } = require('electron')
const log = require('electron-log')
const menubar = require('menubar')
const keychain = require('keytar')
const path = require('path')
const delay = require('delay')
const JiraWorklogs = require('./jira-worklogs')
const Updater = require('./auto-updater')
const keyChainService = (process.env.NODE_ENV !== 'development') ? 'jira-timer-mb' : 'jira-timer-mb-dev'
const Worklogs = new JiraWorklogs(keyChainService)

log.transports.file.level = 'silly'
log.transports.console.level = 'silly'

log.info(app.getName())
log.info(app.getVersion())
console.log(app.getName(), app.getVersion())

// Resolve user $PATH env variable
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
        extensions.map(name => installer.default(installer[name], forceDownload))
      ).then(() => resolve()).catch(console.log)
    } else {
      return resolve()
    }
  })
}

let mb = null
let credentials = null
let jiraUserKey = null
let windowVisible = true
let darkMode = false

app.on('ready', () => {
  installExtensions()

  // Get our keychain credentials and launch menu bar on success or failure
  Worklogs.getCredentialsFromKeyChain()
    .then(keyChainCredentials => {
      credentials = keyChainCredentials
      console.log('Credentials ready')
      launchMenuBar()
    })
    .catch(launchMenuBar)
})

function launchMenuBar () {

  // transparency workaround https://github.com/electron/electron/issues/2170
  setTimeout(() => {

    // For copy and paste to work within the menubar we
    // need to enable the OS standard Edit menus :(
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

    mb = menubar({
      alwaysOnTop: process.env.NODE_ENV === 'development',
      icon: !darkMode ? path.join(app.getAppPath(), '/static/tray-dark.png') : path.join(app.getAppPath(), '/static/tray-dark-active.png'),
      width: 500,
      minWidth: 500,
      maxWidth: 500,
      minHeight: 20,
      hasShadow: false,
      preloadWindow: true,
      resizable: false,
      useContentSize: false,
      transparent: true,
      frame: false,
      toolbar: false
    })

    console.log('MB Created')

    mb.window.credentials = credentials

    // Start event handling for the auto updater
    const autoUpdater = new Updater(mb.window.webContents, log)
    autoUpdater.handleEvents()

    mb.on('ready', () => {
      console.log('Menubar ready')
      mb.tray.setTitle(' Login')
    })

    mb.on('show', () => {
      windowVisible = true

      mb.tray.setImage(path.join(app.getAppPath(), '/static/tray-dark-active.png'))

      if (jiraUserKey) {

        let renderProcess = mb.window.webContents

        // Tell the main process the window is visible
        renderProcess.send('windowVisible')

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
            renderProcess.send('worklogs', JSON.stringify([]))
          })
      }
    })

    mb.on('hide', () => {
      windowVisible = false

      if (!darkMode)
        mb.tray.setImage(path.join(app.getAppPath(), '/static/tray-dark.png'))
      else
        mb.tray.setImage(path.join(app.getAppPath(), '/static/tray-dark-active.png'))
    })
  }, 100)
}

// MacOS dark mode?
if (process.platform === 'darwin') {

  // If enabled before app starts
  darkMode = systemPreferences.isDarkMode()

  console.log('Dark mode main process', darkMode)

  // Listen for dynamic dark mode changes from system preferences
  systemPreferences.subscribeNotification(
    'AppleInterfaceThemeChangedNotification',
    () => {
      darkMode = systemPreferences.isDarkMode()
      console.log('Dark mode switched main process', darkMode)
    }
  )
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC communication
ipcMain.on('quit', () => {
  app.quit()
})

ipcMain.on('windowSizeChange', (event, newHeight) => {
  const [currentWidth, currentHeight] = mb.window.getSize()

  mb.window.setSize(currentWidth, newHeight)
})

ipcMain.on('openDevTools', (event) => {
  mb.window.webContents.openDevTools({ mode: 'detach' })
})

ipcMain.on('updateTitle', (event, title) => {
  mb.tray.setTitle(` ${title}`)
  if (windowVisible)
    mb.showWindow()
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
