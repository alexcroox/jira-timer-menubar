import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import IconLink from '../../components/icon-link'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faHistory from '@fortawesome/fontawesome-free-solid/faHistory'
import SearchContainer from '../search/search-container'
import FooterContainer from '../footer/footer-container'
import RecentContainer from '../recent/recent-container'
import TimerContainer from '../timer/timer-container'
import Header from '../../components/header'

class DashboardContainer extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <Fragment>
        <Header
          titleText="Jira Timer"
          withCreateTaskButton
        />

        <TimerContainer />
        <SearchContainer />
        <RecentContainer />

        <FooterContainer>
          <div>
            <TimeSummaryContainer>
              Today <TimeSummary>4h 15m</TimeSummary>
            </TimeSummaryContainer>

            {this.props.showAllSummaries && (
              <Fragment>
                <TimeSummaryContainer>
                  Yesterday <TimeSummary>7h 30m</TimeSummary>
                </TimeSummaryContainer>
                <TimeSummaryContainer>
                  Week <TimeSummary>32h 45m</TimeSummary>
                </TimeSummaryContainer>
              </Fragment>
            )}
          </div>

          <IconLink to="/worklogs">
            <FontAwesomeIcon icon={faHistory} />
          </IconLink>
        </FooterContainer>
      </Fragment>
    );
  }
}

const TimeSummaryContainer = styled.span`
  margin-right: 20px;
  color: #666;
  font-size: 12px;
`
const TimeSummary = styled.span`
  font-weight: 500;
  margin-left: 2px;
`

const mapStateToProps = state => ({
  authToken: state.user.authToken,
  timers: state.timer.list,
  userProfile: state.user.profile
})

export default connect(mapStateToProps)(DashboardContainer)
