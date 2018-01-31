import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import parse from 'date-fns/parse'
import isToday from 'date-fns/is_today'
import isThisWeek from 'date-fns/is_this_week'
import isYesterday from 'date-fns/is_yesterday'
import { fetchWorklogs } from '../../modules/worklog'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faSyncAlt from '@fortawesome/fontawesome-free-solid/faSyncAlt'
import FooterContainer from '../footer/footer-container'
import TimerContainer from '../timer/timer-container'
import Header from '../../components/header'
import Worklog from '../../components/worklog'
import LargeIcon from '../../components/large-icon'
import HeadingBar from '../../components/heading-bar'
import WorklogTotals from './worklog-totals'


class WorklogContainer extends Component {
  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.fetchWorklogs()
  }

  render () {

    let DayList = []
    let YesterdayList = []
    let WeekList = []

    let alreadyAssigned = []

    if (this.props.worklogs.length) {

      this.props.worklogs.forEach(worklog => {
        let created = parse(worklog.created)

        if (isToday(created)) {
          DayList.push(<Worklog key={worklog.id} {...worklog} />)
          alreadyAssigned.push(worklog.id)
        }

        if (isYesterday(created)) {
          YesterdayList.push(<Worklog key={worklog.id} {...worklog} />)
          alreadyAssigned.push(worklog.id)
        }

        // Week starts on Monday (1)
        if (alreadyAssigned.indexOf(worklog.id) === -1) {
          WeekList.push(<Worklog key={worklog.id} {...worklog} />)
        }
      })
    }

    return (
      <Fragment>
        <Header
          titleText="Posted Times"
          withBackButton
        />

        <TimerContainer />

        <Worklogs>
          {DayList.length !== 0 && (
            <Fragment>
              <HeadingBar borderBottom>
                Today
              </HeadingBar>
              <div>
                {DayList}
              </div>
            </Fragment>
          )}

          {YesterdayList.length !== 0 && (
            <Fragment>
              <HeadingBar borderBottom borderTop>
                Yesterday
              </HeadingBar>
              <div>
                {YesterdayList}
              </div>
            </Fragment>
          )}

          {WeekList.length !== 0 && (
            <Fragment>
              <HeadingBar borderBottom borderTop>
                Earlier in the week
              </HeadingBar>
              <div>
                {WeekList}
              </div>
            </Fragment>
          )}
        </Worklogs>

        <FooterContainer>
          <WorklogTotals showAll />

          <WorklogsUpdating>
            {this.props.updating ? (
              `Fetching worklogs...`
            ) : (
              <LargeIcon clickable onClick={this.props.fetchWorklogs}>
                <FontAwesomeIcon icon={faSyncAlt} />
              </LargeIcon>
            )}
          </WorklogsUpdating>
        </FooterContainer>
      </Fragment>
    );
  }
}

const Worklogs = styled.div`
  overflow: auto;
  height: 331px;
`

const WorklogsUpdating = styled.span`
  opacity: 0.5
`

const mapDispatchToProps = {
  fetchWorklogs
}

const mapStateToProps = state => ({
  worklogs: state.worklog.list,
  updating: state.worklog.updating
})

export default connect(mapStateToProps, mapDispatchToProps)(WorklogContainer)
