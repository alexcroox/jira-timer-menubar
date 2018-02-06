import React, { Component, Fragment } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import IconLink from '../../components/icon-link'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faHistory from '@fortawesome/fontawesome-free-solid/faHistory'
import SearchContainer from '../search/search-container'
import FooterContainer from '../footer/footer-container'
import RecentContainer from '../recent/recent-container'
import TimerContainer from '../timer/timer-container'
import UpdateContainer from '../update/update-container'
import WorklogTotals from '../worklog/worklog-totals'
import Header from '../../components/header'

class DashboardContainer extends Component {
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
          titleText="Jira Timer"
          withCreateTaskButton
          withSettingsButton
        />

        <TimerContainer />
        <UpdateContainer />
        <SearchContainer />
        <RecentContainer />

        <FooterContainer>
          <WorklogTotals />

          <IconLink to="/worklogs">
            <FontAwesomeIcon icon={faHistory} />
          </IconLink>
        </FooterContainer>
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  authToken: state.user.authToken,
  timers: state.timer.list,
  userProfile: state.user.profile
})

export default connect(mapStateToProps)(DashboardContainer)
