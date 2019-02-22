import log from 'electron-log'

if (process.env.NODE_ENV === 'development')
  require('electron-debug')({ showDevTools: true })

const installDevTools = () => {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'development') {
      log.info('Installing dev extensions')

      const installer = require('electron-devtools-installer')

      const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']
      const forceDownload = !!process.env.UPGRADE_EXTENSIONS

      Promise.all(
        extensions.map(name => installer.default(installer[name], forceDownload))
      ).then(() => resolve()).catch(log.info)
    } else {
      return resolve()
    }
  })
}

export default installDevTools
