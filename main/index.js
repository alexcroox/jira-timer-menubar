import { app } from 'electron'
import log from 'electron-log'
import installDevTools from './development/tools'
import menubar from './menubar'
import keychain from './keychain'

log.transports.file.level = 'silly'
log.transports.console.level = 'silly'

log.info(app.getName())
log.info(app.getVersion())
log.info(app.getName(), app.getVersion())

// Resolve user $PATH env variable
require('fix-path')()

app.on('ready', async () => {
  installDevTools()

  // Get our keychain credentials and launch menu bar on success or failure
  try {
    await keychain.getCredentials()
    log.info('Credentials ready, launching...')
    menubar.delayedLaunch()
  } catch (error) {
    log.info('No credentials yet, launching...')
    menubar.delayedLaunch()
  }
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
