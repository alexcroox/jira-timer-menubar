import { remote, ipcRenderer } from 'electron'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { setVersion, setUpdateInfo, setDownloaded } from '../../modules/updater'
import styled from 'styled-components'
import parse from 'date-fns/parse'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
import Button from '../../components/button'

class UpdateContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      showNotes: false
    }

    this.onShowNotes = this.onShowNotes.bind(this)
    this.onInstallUpdate = this.onInstallUpdate.bind(this)
  }

  onShowNotes () {
    this.setState({ showNotes: !this.state.showNotes })
  }

  onInstallUpdate () {
    ipcRenderer.send('installUpdate')
  }

  componentDidMount () {

    console.log('App version', remote.app.getVersion())

    this.props.setVersion(remote.app.getVersion())

    ipcRenderer.send('updateStatus')

    ipcRenderer.on('updateStatus', (event, info) => {
      var updateInfo = JSON.parse(info)
      console.log('updateStatus', updateInfo)
      this.props.setUpdateInfo(updateInfo)
    })

    ipcRenderer.on('updateChecking', () => {
      console.log('updateChecking')
    })

    ipcRenderer.on('updateNotAvailable', () => {
      console.log('updateNotAvailable')
    })

    ipcRenderer.on('updateReady', () => {
      console.log('updateReady')
      this.props.setDownloaded()
    })

    ipcRenderer.on('updateDownloading', (event, info) => {
      console.log('updateDownloading', JSON.stringify(info))
    })

    ipcRenderer.on('updateError', () => {
      console.log('updateError')
    })
  }

  render () {
    if (this.props.updateInfo)
      return (
        <UpdateAvailableWrapper>
          <UpdateAvailableBar>
            {!this.props.downloaded ? (
              <Fragment>
                Version {this.props.updateInfo.version} available! Downloading...
                <Button inline onClick={this.onShowNotes}>
                  {this.state.showNotes ? ('Hide notes') : ('Update notes')}
                </Button>
              </Fragment>
            ) : (
              <Fragment>
                v{this.props.updateInfo.version} is ready to install
                <Button primary onClick={this.onInstallUpdate}>
                  Install and restart
                </Button>
              </Fragment>
            )}
          </UpdateAvailableBar>

          {this.state.showNotes && (
            <UpdateInfo>
              Released {distanceInWordsToNow(parse(this.props.updateInfo.releaseDate))} ago
              <UpdateNotes dangerouslySetInnerHTML={{__html: this.props.updateInfo.releaseNotes}}></UpdateNotes>
            </UpdateInfo>
          )}
        </UpdateAvailableWrapper>
      )
    else return (null)
  }
}

const UpdateAvailableWrapper = styled.div`
  padding: 5px 15px 5px 12px;
  background: #FFFBE6;
`

const UpdateAvailableBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  letter-spacing: 0.02em;
`

const UpdateInfo = styled.div`
  margin-top: 10px;
  font-style: italic;
  border-top: 1px solid #4A9723;
  padding-top: 10px
`

const UpdateNotes = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  font-style: normal;
  line-height: 23px;
`

const mapDispatchToProps = {
  setVersion,
  setUpdateInfo,
  setDownloaded
}

const mapStateToProps = state => ({
  version: state.updater.version,
  updateInfo: state.updater.updateInfo,
  downloaded: state.updater.downloaded,
})

export default connect(mapStateToProps, mapDispatchToProps)(UpdateContainer)



