import { remote, ipcRenderer } from 'electron'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
import Button from '../../components/button'

class UpdateContainer extends Component {
  constructor (props) {
    super(props)

  }

  componentDidMount () {
    ipcRenderer.on('updateDownloading', (event, info) => {

      console.log('updateDownloading', JSON.stringify(info))

      this.checking = false
      this.downloading = true
      this.newVersion = info.version
      this.releaseNotes = info.releaseNotes
    })
  }

  render () {
    if (this.props.updateAvailable)
      return (
        <div>

        </div>
      )
    else return (null)
  }
}

const mapDispatchToProps = {

}

const mapStateToProps = state => ({
  timers: state.timer.list
})

export default connect(mapStateToProps, mapDispatchToProps)(UpdateContainer)



