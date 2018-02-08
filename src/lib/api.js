import request from 'request-promise'
import keychain from 'keytar-prebuild'
import store from './create-store'
import { setAuthToken, userLogout, setProfile } from '../modules/user'
import { fetchWorklogs } from '../modules/worklog'

class Api {

  constructor () {

    let baseUrl = null
    this.jiraDomain = null
    this.authToken = null

    this.request = request.defaults({
      baseUrl,
      timeout: 20000,
      json: true,
      simple: true
    })

    this.getCredentialsFromKeyChain()
      .then(credentials => {
        this.authToken = credentials.password
        this.setAuthHeaders(this.authToken, credentials.account)
        store.dispatch(setAuthToken(this.authToken))

        this.get('/myself')
          .then(response => {
            console.log('Myself', response)
            store.dispatch(setProfile(response))
            store.dispatch(fetchWorklogs())
          })
          .catch(error => console.log('Error fetching self on load'))
      })
      .catch(error => console.log('New user'))
  }

  get (urlPath) {
    return this.send('GET', urlPath)
  }

  post (urlPath, data) {
    return this.send('POST', urlPath, data)
  }

  put (urlPath, data) {
    return this.send('PUT', urlPath, data)
  }

  delete (urlPath, data) {

    console.warn('Deleting', urlPath)

    return this.send('DELETE', urlPath)
  }

  send (method, urlPath, data = '') {
    return new Promise((resolve, reject) => {

      console.log('Api call', urlPath, method)

      this.request({
        url: urlPath,
        method: method,
        body: data
      })
        .then(response => resolve(response))
        .catch(error => {
          // We need to get the user to login again
          if (error.statusCode === 401)
            store.dispatch(userLogout())

          reject(error)
        })
    })
  }

  logout () {
    keychain.deletePassword('jira-timer-menubar', this.jiraDomain)
    this.authToken = null
    this.setAuthHeaders(null, null)
  }

  login (username, password, authUrl) {
    return new Promise((resolve, reject) => {

      // Convert username/password to base64
      this.authToken = this.b64Encode(`${username}:${password}`)

      this.setAuthHeaders(this.authToken, authUrl)

      // Test an endpoint with this auth token
      this.isLoggedIn(true)
        .then(response => {

          console.log('Setting token', response)
          store.dispatch(setProfile(response))
          store.dispatch(setAuthToken(this.authToken))
          keychain.setPassword('jira-timer-menubar', authUrl, this.authToken)

          setTimeout(() => {
            store.dispatch(fetchWorklogs())
          }, 2000)

          resolve(response)
        })
        .catch(error => reject(error))
    })
  }

  isLoggedIn (login = false) {
    return new Promise((resolve, reject) => {

      if (!login)
        this.getCredentialsFromKeyChain()
          .then(credentials => {

            this.authToken = credentials.password

            this.setAuthHeaders(this.authToken, credentials.account)

            this.get('/myself')
              .then(response => {
                resolve(response)
              })
              .catch(error => {
                // We need to get the user to login again
                store.dispatch(userLogout())
                reject(error)
              })
          })
          .catch(error => reject(error))
      else
        this.get('/myself')
          .then(response => resolve(response))
          .catch(error => reject(error))
    })
  }

  setAuthHeaders (authToken, authUrl) {
    this.jiraDomain = authUrl

    this.request = this.request.defaults({
      baseUrl: `https://${authUrl}/rest/api/2`,
      headers: {
        'Authorization': `Basic ${this.authToken}`,
      }
    })
  }

  getCredentialsFromKeyChain () {
    return new Promise((resolve, reject) => {
      keychain.findCredentials('jira-timer-menubar')
        .then(credentials => resolve(credentials[0]))
        .catch(error => reject(error))
    })
  }

  b64Encode (str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
    }))
  }
}

export default new Api()
