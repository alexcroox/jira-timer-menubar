import { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import menubar from './menubar'

class Updater {
  handleEvents () {

    ipcMain.on('installUpdate', (event, message) => {
      log.info('Installing update')
      autoUpdater.quitAndInstall()
    })

    ipcMain.on('updateStatus', event => {
      if (process.env.NODE_ENV !== 'development')
        autoUpdater.checkForUpdates()
      else
        setTimeout(() => menubar.renderProcess.send('updateNotAvailable'), 3000)
    })

    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for updates...')
      menubar.renderProcess.send('updateChecking')
    })

    autoUpdater.on('update-not-available', (ev, info) => {
      log.info('Update not available')

      menubar.renderProcess.send('updateNotAvailable')
    })

    autoUpdater.on('update-available', (updateInfo) => {
      log.info('Update available', updateInfo)
      menubar.renderProcess.send('updateStatus', JSON.stringify(updateInfo))
    })

    autoUpdater.on('download-progress', (progress) => {
      log.info('Download progress', progress);
      menubar.renderProcess.send('updateDownloadProgress', JSON.stringify(progress))
    })

    autoUpdater.on('update-downloaded', (ev, info) => {
      log.info('Update downloaded')
      menubar.renderProcess.send('updateReady')
    })

    autoUpdater.on('error', (ev, err) => {
      log.info('Update error', err)
      menubar.renderProcess.send('updateError')
    })
  }
}

export default new Updater()
