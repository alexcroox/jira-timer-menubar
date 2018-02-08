// CommonJS for Node :(

const { ipcMain } = require('electron')
const request = require('request-promise')
const keychain = require('keytar')
const λ = require('contra')
const flatten = require('array-flatten')
const parse = require('date-fns/parse')
const orderBy = require('lodash.orderby')
const differenceInDays = require('date-fns/difference_in_days')

// JIRA doesn't provide a nice way to return all the users worklogs
// We therefore need to do some pretty heavy lifting and it's best
// not to do this in the render thread. Lets kick it off in the main
// process here and then pass back results to the renderer

class JiraWorklogs {

  constructor () {

    this.authKey = null
    this.baseUrl = null

    this.getCredentialsFromKeyChain()
      .then(credentials => console.log('Keychain credentials found'))
      .catch(error => console.log('Unable to fetch credentials', error))
  }

  fetchMine (userKey, fullWeek) {
    return new Promise((resolve, reject) => {
      if (!this.authKey) {
        this.getCredentialsFromKeyChain()
          .then(() => {
            this.fetch(userKey, fullWeek)
              .then(worklogs => resolve(worklogs))
              .catch(error => reject(error))
          })
          .catch(error => {
            console.log('Unable to fetch credentials', error)
            reject(error)
          })
      } else {
        this.fetch(userKey, fullWeek)
          .then(worklogs => resolve(worklogs))
          .catch(error => reject(error))
      }
    })
  }

  fetch (userKey, fullWeek) {

    this.userKey = userKey

    console.log('Full week?', fullWeek, userKey)

    return new Promise((resolve, reject) => {
      this.fetchRecentlyUpdatedTasks(fullWeek)
        .then(response => {

          let tasks = response.issues
          console.log('Latest tasks', tasks.length)

          let worklogs = []

          // We now need to fetch the worklogs for each of these tasks
          // Lets throttle the number of API calls we are making at once
          λ.each(tasks, 4, (task, callback) => {

            this.fetchWorklogsForTaskAndUser(task)
              .then(userWorklogs => {

                if (userWorklogs.length)
                  worklogs.push(userWorklogs)

                callback()
              })
              .catch(error => { callback(error) })

          }, err => {

            console.log('Finished fetching all worklogs')

            if (err)
              return reject(err)

            let flatWorklogs = flatten(worklogs)
            let orderedWorklogs = orderBy(flatWorklogs, ['created'], ['desc'])

            resolve(flatten(orderedWorklogs))
          })
        })
        .catch(error => {
          console.log('Error fetching latest tasks', error)
          reject(error)
        })
    })
  }

  fetchRecentlyUpdatedTasks (fullWeek) {
    return new Promise((resolve, reject) => {

      let start = fullWeek ? 'startOfWeek()' : 'startOfDay()'

      this.sendRequest('/search', 'POST', {
          jql: `updated >= ${start} ORDER BY updated DESC`,
          maxResults: 100,
          fields: ['key', 'summary', 'project']
        })
        .then(issues => resolve(issues))
        .catch(error => reject(error))
    })
  }

  fetchWorklogsForTaskAndUser (task) {
    return new Promise((resolve, reject) => {

      this.sendRequest(`/issue/${task.key}/worklog?maxResults=100`, 'GET')
        .then(response => {

          let currentUserWorklogs = []

          response.worklogs.forEach(worklog => {

            let created = parse(worklog.created)
            let ageInDays = differenceInDays(new Date(), created)

            if (worklog.author.key == this.userKey && ageInDays < 5)
              currentUserWorklogs.push({
                id: worklog.id,
                created: worklog.created,
                timeSpentSeconds: worklog.timeSpentSeconds,
                task: {
                  id: task.id,
                  key: task.key,
                  summary: task.fields.summary
                }
              })
          })

          resolve(currentUserWorklogs)
        })
        .catch(error => reject(error))
    })
  }

  sendRequest (urlPath, method, data = {}) {
    return new Promise((resolve, reject) => {
      request({
        uri: `https://${this.baseUrl}/rest/api/2${urlPath}`,
        headers: {
          'Authorization': `Basic ${this.authKey}`,
        },
        method: method,
        body: data,
        simple: true,
        timeout: 20000,
        json: true,
      })
        .then(response => resolve(response))
        .catch(error => reject(error))
    })
  }

  getCredentialsFromKeyChain () {
    return new Promise((resolve, reject) => {
      keychain.findCredentials('jira-timer-menubar')
        .then(credentials => {
          if (!credentials || !credentials.length)
            return reject('No credentials yet')

          console.log('Set credentials')

          this.authKey = credentials[0].password
          this.baseUrl = credentials[0].account

          resolve(credentials[0])
        })
        .catch(error => reject(error))
    })
  }
}

module.exports = new JiraWorklogs()
