// CommonJS for Node :(
const { app, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')

class Updater {

  constructor (renderProcess, log) {

    this.renderProcess = renderProcess
    autoUpdater.logger = log
    autoUpdater.logger.transports.file.level = 'info'
  }

  handleEvents () {

    ipcMain.on('installUpdate', (event, message) => {
      console.log('Installing update')
      autoUpdater.quitAndInstall()
    })

    ipcMain.on('updateStatus', (event) => {

      if (process.env.NODE_ENV !== 'development')
        autoUpdater.checkForUpdates()
      else
        setTimeout(() => this.renderProcess.send('updateNotAvailable'), 3000)
    })

    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for updates...')
      this.renderProcess.send('updateChecking')
    })

    autoUpdater.on('update-not-available', (ev, info) => {

      console.log('Update not available')

      this.renderProcess.send('updateNotAvailable')
    })

    autoUpdater.on('update-available', (updateInfo) => {

      console.log('Update available', updateInfo)
      this.renderProcess.send('updateStatus', JSON.stringify(updateInfo))
    })

    autoUpdater.on('download-progress', (progress) => {
      console.log('Download progress', progress);
      this.renderProcess.send('updateDownloadProgress', JSON.stringify(progress))
    })

    autoUpdater.on('update-downloaded', (ev, info) => {
      console.log('Update downloaded')
      this.renderProcess.send('updateReady')
    })

    autoUpdater.on('error', (ev, err) => {
      console.log('Update error', err)
      this.renderProcess.send('updateError')
    })
  }
}

module.exports = Updater
