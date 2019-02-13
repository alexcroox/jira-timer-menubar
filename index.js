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
const url = require('url')

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
let credentials = null
let jiraUserKey = null
let windowVisible = false
let darkMode = false
let timerRunning = false
let currentIcon = path.join(app.getAppPath(), '/static/tray-dark.png')
let title = null

app.on('ready', () => {
  installExtensions()

  // Get our keychain credentials and launch menu bar on success or failure
  Worklogs.getCredentialsFromKeyChain()
    .then(keyChainCredentials => {
      credentials = keyChainCredentials
      log.info('Credentials ready')
      launchMenuBar()
    })
    .catch(launchMenuBar)
})

// MacOS dark mode?
if (process.platform === 'darwin') {

  // If enabled before app starts
  darkMode = systemPreferences.isDarkMode()

  currentIcon = !darkMode ? path.join(app.getAppPath(), '/static/tray-dark.png') : path.join(app.getAppPath(), '/static/tray-white.png')

  log.info('Dark mode main process', darkMode)

  // Listen for dynamic dark mode changes from system preferences
  systemPreferences.subscribeNotification(
    'AppleInterfaceThemeChangedNotification',
    () => {
      darkMode = systemPreferences.isDarkMode()
      log.info('Dark mode switched main process', darkMode)
    }
  )
}

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
      icon: currentIcon,
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

    log.info('MB Created')

    mb.window.credentials = credentials

    // Start event handling for the auto updater
    const autoUpdater = new Updater(mb.window.webContents, log)
    autoUpdater.handleEvents()

    mb.on('ready', () => {
      log.info('Menubar ready')
      mb.tray.setTitle(' Login')
    })

    mb.on('show', () => {
      windowVisible = true

      updateTrayIcon()

      if (jiraUserKey) {

        let renderProcess = mb.window.webContents

        // Tell the main process the window is visible
        renderProcess.send('windowVisible')

        Worklogs.checkLock(true)
          .then(() => {
            log.info('Telling render process we are fetching worklogs')
            renderProcess.send('fetchingWorklogs')

            let fullWeek = false

            Worklogs.request(jiraUserKey, fullWeek, true)
              .then(worklogs => {
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

      updateTrayIcon()
    })
  }, 100)
}

// Register deep link protocol
app.setAsDefaultProtocolClient('jiratimer')

// Protocol handler for osx
app.on('open-url', (e, deepLinkRawUrl) => {
  e.preventDefault()

  let deepLinkUrl = url.parse(deepLinkRawUrl)
  log.info('Deep link', JSON.stringify({ deepLinkUrl }))

  renderProcess.send('create-timer', JSON.stringify({
    taskKey: deepLinkUrl.path
  }))

  mb.showWindow()
})

const updateTrayIcon = () => {

  let newIcon = null

  // Blue for both dark and light if timer running
  if (!windowVisible) {
    if (timerRunning) {
      newIcon = path.join(app.getAppPath(), '/static/tray-timing.png')
    } else {
      // White for dark mode, Grey for light mode if no timer running
      if (darkMode)
        newIcon = path.join(app.getAppPath(), '/static/tray-white.png')
      else
        newIcon = path.join(app.getAppPath(), '/static/tray-dark.png')
    }
  } else {
    // Window visible
    newIcon = path.join(app.getAppPath(), '/static/tray-white.png')
  }

  if (currentIcon !== newIcon)
    mb.tray.setImage(newIcon)

  currentIcon = newIcon
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

ipcMain.on('updateTitle', (event, args) => {
  let newTitle = ''

  timerRunning = args.timerRunning

  if (args.title === '' || !args.title)
    newTitle = ''
  else
    newTitle =  ` ${args.title}`

  if (title !== newTitle)
  mb.tray.setTitle(newTitle)

  title = newTitle

  // if (windowVisible)
  //   mb.showWindow()

  updateTrayIcon()
})

ipcMain.on('setPassword', (event, args) => {
  keychain.setPassword(keyChainService, args.jiraDomain, args.authToken)
})

ipcMain.on('deletePassword', (event) => {
  Worklogs.getCredentialsFromKeyChain()
    .then(keyChainCredentials => {
      keychain.deletePassword(keyChainService, keyChainCredentials.account)
    })
    .catch(() => log.info('Failed to delete keychain as it doesnt exist'))
})

ipcMain.on('fetchWorklogs', (event, args) => {
  let { userKey } = args

  jiraUserKey = userKey

  Worklogs.request(userKey)
    .then(worklogs => {
      event.sender.send('worklogs', JSON.stringify({
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
