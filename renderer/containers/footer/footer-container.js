
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { withRouter } from 'react-router-dom'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faCog from '@fortawesome/fontawesome-free-solid/faCog'
import faHistory from '@fortawesome/fontawesome-free-solid/faHistory'
import WorklogTotals from '../worklog/worklog-totals'
import IconWrap from '../../components/icon-wrap'
import IconLink from '../../components/icon-link'

class FooterContainer extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const settingsPath = this.props.location.pathname === '/settings' ? '/dashboard' : '/settings'
    const worklogsPath = this.props.location.pathname === '/worklogs' ? '/dashboard' : '/worklogs'

    return (
      <FooterWrapper>
        <WorklogTotals />

        <IconWrap>
          <IconLink to={worklogsPath} title="View worklog history">
            <FontAwesomeIcon icon={faHistory} />
          </IconLink>

          <IconLink to={settingsPath} title="Settings">
            <FontAwesomeIcon icon={faCog} />
          </IconLink>
        </IconWrap>
      </FooterWrapper>
    )
  }
}

export const FooterWrapper = styled.div`
  background: ${props => props.theme.darkMode ? props.theme.dark.backgroundColor : '#EAEAEA' };
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding-left: 10px;
  padding-right: 10px;
  border-top: 1px solid ${props => props.theme.darkMode ? props.theme.dark.border : '#D0D0D0' };
  border-radius: 0 0 6px 6px;
  color: ${props => props.theme.darkMode ? props.theme.dark.inactiveColor : 'inherit' };
`

const mapStateToProps = state => ({
  authToken: state.user.authToken,
})

export default withRouter(connect(mapStateToProps)(FooterContainer))
