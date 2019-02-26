import {
  app,
  systemPreferences,
  Menu
} from 'electron'
import path from 'path'
import menubar from 'menubar'
import log from 'electron-log'
import autoUpdater from './auto-updater'
import rendererCommunication from './renderer-communication'
import updateTrayIcon from './lib/update-tray-icon'
import deepLink from './deep-link'
import keychain from './keychain'
import jiraWorklogs from './jira-worklogs'

// For copy and paste to work within the menubar we
// need to enable the OS standard Edit menus :(
const menuItems = Menu.buildFromTemplate([{
  label: 'Edit',
  submenu: [{
      role: 'undo'
    },
    {
      role: 'redo'
    },
    {
      type: 'separator'
    },
    {
      role: 'cut'
    },
    {
      role: 'copy'
    },
    {
      role: 'paste'
    },
    {
      role: 'pasteandmatchstyle'
    },
    {
      role: 'delete'
    },
    {
      role: 'selectall'
    }
  ]
}])

class Menubar {
  constructor() {
    this.currentIcon = path.join(app.getAppPath(), '/static/tray-dark.png')
    this.handler = null
    this.renderProcess = null
    this.windowVisible = false
    this.darkMode = false
    this.title = ' Login'
    this.timerRunning = false

    this.initDarkMode()
  }

  // Transparency workaround https://github.com/electron/electron/issues/2170
  delayedLaunch() {
    setTimeout(this.launch.bind(this), 100)
  }

  launch() {

    Menu.setApplicationMenu(menuItems)

    this.handler = menubar({
      alwaysOnTop: process.env.NODE_ENV === 'development',
      icon: this.currentIcon,
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

    this.handleEvents()

    log.info('Menubar Created')

    this.handler.window.credentials = keychain.credentials
  }

  handleEvents() {

    this.handler.on('ready', () => {
      log.info('Menubar ready')

      this.handler.tray.setTitle(' Login')

      this.renderProcess = this.handler.window.webContents

      // Start event handling for the auto updater
      autoUpdater.handleEvents()
      rendererCommunication.handleEvents()
    })

    this.handler.on('show', async () => {
      this.windowVisible = true

      updateTrayIcon()

      if (keychain.jiraUserKey) {

        // Tell the main process the window is visible
        this.renderProcess.send('windowVisible')

        if (deepLink.taskKey)
          deepLink.sendCreateTimerMessage()

        this.renderProcess.send('fetchingWorklogs')

        try {
          let worklogs = await jiraWorklogs.request(keychain.jiraUserKey)
          this.renderProcess.send('worklogs', JSON.stringify({
            worklogs
          }))
        } catch (error) {
          log.error('Error fetching worklogs', error)
          this.renderProcess.send('worklogs', JSON.stringify([]))
        }
      }
    })

    this.handler.on('hide', async () => {
      this.windowVisible = false
      updateTrayIcon()
    })
  }

  updateTitle(event, args) {
    let newTitle = ''

    this.timerRunning = args.timerRunning

    if (args.title === '' || !args.title)
      newTitle = ''
    else
      newTitle = ` ${args.title}`

    if (this.title !== newTitle && this.handler)
      this.handler.tray.setTitle(newTitle)

    this.title = newTitle

    updateTrayIcon()
  }

  initDarkMode() {
    // MacOS dark mode?
    if (process.platform === 'darwin') {

      // If enabled before app starts
      this.darkMode = systemPreferences.isDarkMode()

      this.currentIcon = !this.darkMode ?
        path.join(app.getAppPath(), '/static/tray-dark.png') :
        path.join(app.getAppPath(), '/static/tray-white.png')

      log.info('Dark mode main process', this.darkMode)

      // Listen for dynamic dark mode changes from system preferences
      systemPreferences.subscribeNotification(
        'AppleInterfaceThemeChangedNotification',
        () => {
          this.darkMode = systemPreferences.isDarkMode()
          log.info('Dark mode switched main process', this.darkMode)
        }
      )
    }
  }
}

export default new Menubar()
