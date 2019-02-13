// Here we handle communication between the "main" process (/index.js) and the "renderer" process (/src/index.js)
import { ipcRenderer } from 'electron'
import store from './create-store'
import { addWorklogs, setUpdating } from '../modules/worklog'
import { setUpdateInfo, setDownloaded, setChecking, setUpdateAvailable } from '../modules/updater'
import { addTimer } from '../modules/timer'
import api from './api'

const handleComms = () => {

  // Request status of the auto update
  ipcRenderer.send('updateStatus')

  ipcRenderer.on('fetchingWorklogs', (event, info) => {
    store.dispatch(setUpdating(true))
  })

  // Listen out for worklogs coming from main process
  ipcRenderer.on('worklogs', (event, worklogPayload) => {
    let payload = JSON.parse(worklogPayload)
    let worklogs = payload.worklogs

    if (typeof payload.worklogs !== "undefined") {
      console.log('Got worklogs from main process', payload.worklogs.length)
      store.dispatch(addWorklogs(worklogs))
    }

    store.dispatch(setUpdating(false))
  })

  ipcRenderer.on('create-timer', async (event, dataPayload) => {
    let data = JSON.parse(dataPayload)
    let taskKey = data.taskKey

    console.log('Create timer called', data)

    try {
      let task = await api.get(`/issue/${taskKey}?fields=summary`)
      console.log('Found deep link task', task)

      store.dispatch(addTimer(task.id, taskKey, task.fields.summary))
    } catch (error) {
      console.error('Error deep link adding timer', error)
    }
  })


  ipcRenderer.on('updateStatus', (event, info) => {
    var updateInfo = JSON.parse(info)
    console.log('updateStatus', updateInfo)
    store.dispatch(setUpdateInfo(updateInfo))
    store.dispatch(setChecking(false))
  })

  ipcRenderer.on('updateReady', () => {
    console.log('updateReady')
    store.dispatch(setDownloaded())
  })

  ipcRenderer.on('updateNotAvailable', () => {
    console.log('updateNotAvailable')
    store.dispatch(setUpdateAvailable(false))
    store.dispatch(setChecking(false))
  })
}

export default handleComms
