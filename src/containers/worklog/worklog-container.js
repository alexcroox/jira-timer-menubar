import { remote } from 'electron'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { deleteWorklog } from '../../modules/worklog'
import styled from 'styled-components'
import { openInJira } from '../../lib/jira'
import { secondsHuman } from '../../lib/time'
import parse from 'date-fns/parse'
import isToday from 'date-fns/is_today'
import isThisWeek from 'date-fns/is_this_week'
import isYesterday from 'date-fns/is_yesterday'
import { fetchWorklogs } from '../../modules/worklog'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faSyncAlt from '@fortawesome/fontawesome-free-solid/faSyncAlt'
import FooterContainer from '../footer/footer-container'
import TimerContainer from '../timer/timer-container'
import UpdateContainer from '../update/update-container'
import Header from '../../components/header'
import Worklog from '../../components/worklog'
import LargeIcon from '../../components/large-icon'
import HeadingBar from '../../components/heading-bar'
import WorklogTotals from './worklog-totals'

class WorklogContainer extends Component {
  constructor (props) {
    super(props)

    this.onOpenOptions = this.onOpenOptions.bind(this)
  }

  componentWillMount () {
    this.props.fetchWorklogs(false)
  }

  onOpenOptions (worklog) {
    const { Menu, MenuItem } = remote

    const menu = new Menu()
    const deleteWorklog = this.props.deleteWorklog

    menu.append(new MenuItem({
      label: `Edit ${secondsHuman(worklog.timeSpentSeconds)} logged for ${worklog.task.key}`,
      click () { openInJira(worklog.task.key) }
    }))

    menu.append(new MenuItem({
      label: `Open ${worklog.task.key} in JIRA`,
      click () { openInJira(worklog.task.key) }
    }))

    menu.append(new MenuItem({
      label: `Delete ${secondsHuman(worklog.timeSpentSeconds)} from ${worklog.task.key}`,
      click () { deleteWorklog(worklog) }
    }))

    menu.popup()
  }

  render () {

    let DayList = []
    let YesterdayList = []
    let WeekList = []

    let alreadyAssigned = []

    if (this.props.worklogs.length) {

      this.props.worklogs.forEach(worklog => {
        let created = parse(worklog.created)

        let WorkLogTemplate = <Worklog
          key={worklog.id}
          onOpenOptions={() => this.onOpenOptions(worklog)}
          {...worklog}
        />

        if (isToday(created)) {
          DayList.push(WorkLogTemplate)
          alreadyAssigned.push(worklog.id)
        }

        if (isYesterday(created)) {
          YesterdayList.push(WorkLogTemplate)
          alreadyAssigned.push(worklog.id)
        }

        // Week starts on Monday (1)
        if (alreadyAssigned.indexOf(worklog.id) === -1) {
          WeekList.push(WorkLogTemplate)
        }
      })
    }

    return (
      <Fragment>
        <Header
          titleText="Posted Times"
          withBackButton
        />

        <UpdateContainer />
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
  fetchWorklogs,
  deleteWorklog
}

const mapStateToProps = state => ({
  worklogs: state.worklog.list,
  updating: state.worklog.updating
})

export default connect(mapStateToProps, mapDispatchToProps)(WorklogContainer)
