import React, { Component, Fragment } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { userLogout } from '../../modules/user'
import keychain from 'keytar'
import styled from 'styled-components'
import FooterContainer from '../footer/footer-container'
import TimerContainer from '../timer/timer-container'
import UpdateContainer from '../update/update-container'
import Header from '../../components/header'
import Button from '../../components/button'
import Divider from '../../components/divider'
import Section from '../../components/section'

class SettingsContainer extends Component {
  constructor (props) {
    super(props)

  }

  render () {
    return (
      <Fragment>
        {!this.props.authToken && (
          <Redirect to="/" />
        )}

        <Header
          titleText="Settings"
          withBackButton
          withQuitButton
        />

        <TimerContainer />
        <UpdateContainer />

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

        <Section noPaddingTop>
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

const mapDispatchToProps = {
  userLogout
}

const mapStateToProps = state => ({
  authToken: state.user.authToken,
  profile: state.user.profile
})

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer)

