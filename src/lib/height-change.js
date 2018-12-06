// We need to dynamically change the main window height whenever the
// render content height changes
import { ipcRenderer } from 'electron'

let lastHeight = document.body.clientHeight

const watchHeightChanges = () => {
  window.requestAnimationFrame(checkHeightSizeChange)
}

const checkHeightSizeChange = () => {
  let currentHeight = document.body.clientHeight
  let heightHasChanged = lastHeight !== currentHeight

  if (heightHasChanged) {
    lastHeight = currentHeight

    // Tell the main processs to resize the window
    ipcRenderer.send('windowSizeChange', currentHeight)
  }

  window.requestAnimationFrame(checkHeightSizeChange)
}

export default watchHeightChanges
