import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
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
        <FooterContainer />
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  authToken: state.user.authToken,
  timers: state.timer.list
})

export default connect(mapStateToProps)(DashboardContainer)
