import { ipcMain } from 'electron'
import log from 'electron-log'
import keychain from 'keytar'
import keychainService from './keychain-service'

class Keychain {
  constructor() {
    this.credentials = null
    this.authKey = null
    this.baseUrl = null
    this.jiraUserKey = null

    this.handleEvents()
  }

  handleEvents() {
    ipcMain.on('deletePassword', async (event) => {
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
      this.credentials = await keychain.findCredentials(keychainService)

      if (!this.credentials || !this.credentials.length)
        throw 'No credentials yet'

      log.info('Set credentials')

      this.authKey = this.credentials[0].password
      this.baseUrl = this.credentials[0].account

      return this.credentials[0]
    } catch (error) {
      return error
    }
  }
}

export default new Keychain()
