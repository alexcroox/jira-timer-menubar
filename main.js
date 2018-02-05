import { app, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import menubar from 'menubar'
import path from 'path'
import JiraWorklogs from './jira-worklogs'

log.transports.console.level = 'warn'
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info'

log.info(app.getName());
log.info(app.getVersion());

console.log(app.getName(), app.getVersion())

require('fix-path')(); // resolve user $PATH env variable

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')({ showDevTools: true });
}

const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer');

    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

    return Promise.all(
      extensions.map(name => installer.default(installer[name], forceDownload)),
    ).catch(console.log);
  }
};

console.log('userData', app.getPath('userData'));

let fetchingWorklogs = false
let willQuitApp = false

// menubar
const mb = menubar({
  alwaysOnTop: process.env.NODE_ENV === 'development',
  icon: path.join(app.getAppPath(), '/static/tray.png'),
  minWidth: 500,
  maxWidth: 500,
  minHeight: 530,
  hasShadow: false,
  preloadWindow: process.env.NODE_ENV !== 'development',
  resizable: true,
  transparent: true,
});

mb.on('ready', async () => {
  await installExtensions();

  mb.tray.setTitle(' Login')

  console.log('app is ready'); // eslint-disable-line

  if (process.env.NODE_ENV !== 'development')
    autoUpdater.checkForUpdates()
});

mb.on('show', () => {
  mb.tray.setImage(path.join(app.getAppPath(), '/static/tray-active.png'))
});

mb.on('hide', () => {
  mb.tray.setImage(path.join(app.getAppPath(), '/static/tray.png'))
});

app.on('before-quit', () => willQuitApp = true)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ipc communication
ipcMain.on('quit', () => {
  app.quit();
});

ipcMain.on('updateInstall', (event, message) => {

  console.log('Installing update')

  willQuitApp = true
  autoUpdater.quitAndInstall()
})

ipcMain.on('updateTitle', (event, title) => {
  mb.tray.setTitle(` ${title}`)
});

ipcMain.on('refreshPosition', (event, args) => {
  //mb.showWindow()
});

ipcMain.on('fetchWorklogs', (event, args) => {

  let { userKey, fullWeek } = args

  if (fetchingWorklogs) {
    console.log('Already fetching worklogs, request denied')
    return
  }

  fetchingWorklogs = true

  let executionStart = Date.now()

  JiraWorklogs.fetchMine(userKey, fullWeek)
    .then(worklogs => {
      fetchingWorklogs = false
      let executionSeconds = Math.round((Date.now() - executionStart) / 1000)
      console.log('Fetched worklogs', worklogs.length, `Took: ${executionSeconds} seconds`)
      event.sender.send('worklogs', JSON.stringify(worklogs))
    })
    .catch(error => {
      console.log('Failed to fetch worklogs', error)
      event.sender.send('worklogs', JSON.stringify([]))
    })
});

autoUpdater.on('checking-for-update', () => {
  mb.webContents.send('updateChecking')
})

autoUpdater.on('update-not-available', (ev, info) => {

  mb.webContents.send('updateNotAvailable')
})

autoUpdater.on('update-available', (updateInfo) => {

  mb.webContents.send('updateDownloading', updateInfo)
})

autoUpdater.on('update-downloaded', (ev, info) => {

  mb.webContents.send('updateReady')
})

autoUpdater.on('error', (ev, err) => {
  mb.webContents.send('updateError')
})
