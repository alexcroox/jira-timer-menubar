import { ipcRenderer } from 'electron'
import React, { Component, Fragment } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { userLogout } from '../../modules/user'
import { setChecking } from '../../modules/updater'
import { Margin } from 'styled-components-spacing'
import styled from 'styled-components'
import FooterContainer from '../footer/footer-container'
import TimerContainer from '../timer/timer-container'
import UpdateContainer from '../update/update-container'
import Header from '../../components/header'
import HeadingBar from '../../components/heading-bar'
import Button from '../../components/button'
import Divider from '../../components/divider'
import Section, { SectionTitle } from '../../components/section'

class SettingsContainer extends Component {
  constructor (props) {
    super(props)

    this.onOpenDevTools = this.onOpenDevTools.bind(this)
    this.onCheckForUpdates = this.onCheckForUpdates.bind(this)
  }

  onOpenDevTools () {
    ipcRenderer.send('openDevTools')
  }

  onCheckForUpdates () {
    console.log('Checking for updates')
    this.props.setChecking(true)
    ipcRenderer.send('updateStatus')
  }

  render () {
    return (
      <Fragment>
        {!this.props.authToken && (
          <Redirect to="/" />
        )}

        <Header
          titleText="Settings"
          settingsLink="/dashboard"
          withBackButton
          withSettingsButton
          withQuitButton
        />

        <UpdateContainer />
        <TimerContainer />

        {this.props.profile && this.props.profile.avatarUrls && (
          <Fragment>
            <ProfileWrapper>
              <ProfileImage src={this.props.profile.avatarUrls['48x48']} />
              <ProfileDetails>
                <ProfileName>{this.props.profile.displayName}</ProfileName>
                <ProfileName>{this.props.profile.emailAddress}</ProfileName>
              </ProfileDetails>
              <Button default onClick={this.props.userLogout}>Logout</Button>
            </ProfileWrapper>
          </Fragment>
        )}

        <Divider />

        <Section noPaddingTop>
          <SectionTitle>About</SectionTitle>
          <Margin bottom={2}>App version v{this.props.version}</Margin>

          <FlexContainer>
            <div>
              <Button
                primary
                onClick={this.onCheckForUpdates}
                loading={this.props.updatesChecking}
              >
                {!this.props.updatesChecking ? ('Check for updates') : ('Checking for updates...')}
              </Button>

              {!this.props.updateAvailable && (
                <Margin top={2}>No updates available</Margin>
              )}
            </div>
          </FlexContainer>
        </Section>
      </Fragment>
    );
  }
}

const ProfileWrapper = styled.div`
  margin: 10px;
  display: flex;
  align-items: center;
`

const ProfileImage = styled.img`
  margin-right: 15px;
`

const ProfileDetails = styled.div`
  flex: 1;
`

const ProfileName = styled.span`
  display: block;
  font-size: 14px;

  &:first-child {
    font-weight: bold;
    margin-bottom: 5px;
  }
`

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`

const mapDispatchToProps = {
  userLogout,
  setChecking
}

const mapStateToProps = state => ({
  authToken: state.user.authToken,
  profile: state.user.profile,
  version: state.updater.version,
  updateAvailable: state.updater.updateAvailable,
  updatesChecking: state.updater.checking,
})

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer)
