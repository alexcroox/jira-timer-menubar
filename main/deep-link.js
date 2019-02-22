import { app } from 'electron'
import log from 'electron-log'
import url from 'url'
import menubar from './menubar'

class DeepLink {
  constructor() {
    this.taskKey = null

    // Register deep link protocol
    app.setAsDefaultProtocolClient('jiratimer')

    this.handleEvents()
  }

  handleEvents() {
    // Protocol handler for osx
    app.on('open-url', (e, deepLinkRawUrl) => {
      e.preventDefault()

      let deepLinkUrl = url.parse(deepLinkRawUrl)
      log.info('Deep link', JSON.stringify({ deepLinkUrl }))

      // This event is called immediately when deep linking
      // The app may not yet be ready so we need to fire the
      // renderProcess message later
      if (menubar.renderProcess)
        this.sendCreateTimerMessage(deepLinkUrl.path)
      else
        this.taskKey = deepLinkUrl.path
    })
  }

  sendCreateTimerMessage() {
    menubar.renderProcess.send('create-timer', JSON.stringify({
      taskKey: this.taskKey
    }))

    // Let's blank the taskKey until a deep link is clicked again
    this.taskKey = null

    menubar.handler.showWindow()
  }
}

export default new DeepLink()
