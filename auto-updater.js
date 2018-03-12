// CommonJS for Node :(

const { ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')

class Updater {

  constructor (log) {
    autoUpdater.logger = log
    autoUpdater.logger.transports.file.level = 'info'
  }

  handleEvents () {

    ipcMain.on('installUpdate', (event, message) => {

      console.log('Installing update')

      willQuitApp = true
      autoUpdater.quitAndInstall()
    })

    ipcMain.on('updateStatus', (event) => {

      if (process.env.NODE_ENV !== 'development')
        autoUpdater.checkForUpdates()
    })

    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for updates...')
      mb.window.webContents.send('updateChecking')
    })

    autoUpdater.on('update-not-available', (ev, info) => {

      console.log('Update not available')

      mb.window.webContents.send('updateNotAvailable')
    })

    autoUpdater.on('update-available', (updateInfo) => {

      console.log('Update available', updateInfo)
      updateAvailable = updateInfo
      mb.window.webContents.send('updateStatus', JSON.stringify(updateAvailable))
    })

    autoUpdater.on('download-progress', (progress) => {
      console.log('Download progress', progress);
      mb.window.webContents.send('updateDownloadProgress', JSON.stringify(progress))
    })

    autoUpdater.on('update-downloaded', (ev, info) => {
      console.log('Update downloaded')
      mb.window.webContents.send('updateReady')
    })

    autoUpdater.on('error', (ev, err) => {
      console.log('Update error', err)
      mb.window.webContents.send('updateError')
    })
  }
}

module.exports = Updater
