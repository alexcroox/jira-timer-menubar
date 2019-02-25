import { ipcMain } from 'electron'
import log from 'electron-log'
import keychain from 'keytar'
import keychainService from './lib/keychain-service'

class Keychain {
  constructor() {
    this.credentials = null
    this.authKey = null
    this.baseUrl = null
    this.jiraUserKey = null

    this.handleEvents()
  }

  handleEvents() {
    ipcMain.on('deletePassword', async () => {
      try {
        let keyChainCredentials = this.getCredentials()
        keychain.deletePassword(keychainService, keyChainCredentials.account)
      } catch(error) {
        log.error('Failed to delete keychain as it doesnt exist')
      }
    })

    ipcMain.on('setPassword', (event, args) => {
      keychain.setPassword(keychainService, args.jiraDomain, args.authToken)
    })
  }

  async getCredentials () {
    try {
      const credentials = await keychain.findCredentials(keychainService)

      if (!credentials || !credentials.length)
        throw 'No credentials yet'

      log.info('Set credentials')

      this.authKey = credentials[0].password
      this.baseUrl = credentials[0].account

      this.credentials = credentials[0]

      return credentials[0]
    } catch (error) {
      return error
    }
  }
}

export default new Keychain()
