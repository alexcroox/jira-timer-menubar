import { remote } from 'electron'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { deleteWorklog } from '../../modules/worklog'
import styled from 'styled-components'
import { openInJira } from '../../lib/jira'
import { secondsHuman } from '../../lib/time'
import sortBy from 'lodash.sortby'
import find from 'lodash.find'
import parseDuration from 'parse-duration'
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import isToday from 'date-fns/is_today'
import isThisWeek from 'date-fns/is_this_week'
import isYesterday from 'date-fns/is_yesterday'
import { fetchWorklogs, updateWorkLogTime } from '../../modules/worklog'
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
const { Menu, MenuItem } = remote

class WorklogContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      editingWorklogTime: null
    }

    this.onOpenOptions = this.onOpenOptions.bind(this)
    this.onFetchOptions = this.onFetchOptions.bind(this)
    this.onTimeChanged = this.onTimeChanged.bind(this)
    this.onEditTime = this.onEditTime.bind(this)
    this.onResetEditTime = this.onResetEditTime.bind(this)
  }

  componentWillMount () {
    this.props.fetchWorklogs(false)
  }

  onFetchOptions () {
    const menu = new Menu()
    const fetchWorklogs = this.props.fetchWorklogs

    menu.append(new MenuItem({
      label: `(fast) Just today`,
      click () { fetchWorklogs(false) }
    }))

    menu.append(new MenuItem({
      label: `(slow) From week start`,
      click () { fetchWorklogs(true) }
    }))

    menu.popup({})
  }

  onOpenOptions (worklog) {
    const menu = new Menu()

    menu.append(new MenuItem({
      label: `Edit ${secondsHuman(worklog.timeSpentSeconds)} logged for ${worklog.task.key}`,
      click: () => { this.setState({ editingWorklogTime: worklog.id }) }
    }))

    menu.append(new MenuItem({
      label: `Open ${worklog.task.key} in JIRA`,
      click () { openInJira(worklog.task.key) }
    }))

    menu.append(new MenuItem({
      label: `Delete ${secondsHuman(worklog.timeSpentSeconds)} from ${worklog.task.key}`,
      click: () => { this.props.deleteWorklog(worklog) }
    }))

    menu.popup({})
  }

  onEditTime (worklogId) {
    this.setState({ editingWorklogTime: worklogId })
  }

  onTimeChanged (worklog, editedTime) {
    if (editedTime != '') {
      let ms = parseDuration(editedTime)

      // Is the timer entered valid?
      if (ms > 0)
        this.props.updateWorkLogTime(worklog, Math.round(ms / 1000))
    }

    this.onResetEditTime()
  }

  onResetEditTime () {
    this.setState({ editingWorklogTime: null })
  }

  render () {

    let DayList = []
    let YesterdayList = []
    let WeekList = []

    let alreadyAssigned = []

    if (this.props.worklogs && this.props.worklogs.length) {

      this.props.worklogs.forEach(worklog => {
        let created = parse(worklog.created)

        let WorkLogTemplate = <Worklog
          key={worklog.id}
          updating={this.props.updatingWorklog === worklog.id}
          editingWorklogTime={this.state.editingWorklogTime}
          onTimeChanged={(timeId, editedTime) => { this.onTimeChanged(worklog, editedTime) }}
          onEditTime={this.onEditTime}
          onResetEditTime={this.onResetEditTime}
          timeEditPlaceholder={secondsHuman(worklog.timeSpentSeconds)}
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

        // For the rest of the week group by day of week heading
        if (alreadyAssigned.indexOf(worklog.id) === -1) {
          let weekDay = format(created, 'dddd')
          let weekIndex = format(created, 'd')
          let findExistingDay = find(WeekList, ['weekIndex', weekIndex])
          if (!findExistingDay) {
            WeekList.push({
              label: weekDay,
              weekIndex,
              tasks: [WorkLogTemplate]
            })
          } else {
            findExistingDay.tasks.push(WorkLogTemplate)
          }
        }
      })

      // Order WeekList
      WeekList = sortBy(WeekList, ['index'])
    }

    return (
      <Fragment>
        <Header
          titleText="Posted Times"
          settingsLink="/settings"
          withSettingsButton
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

          {WeekList.map(weekDay => (
            <div key={weekDay.weekIndex}>
              <HeadingBar borderBottom borderTop>
                {weekDay.label}
              </HeadingBar>
              <div>
                {weekDay.tasks}
              </div>
            </div>
          ))}
        </Worklogs>

        <FooterContainer>
          <WorklogTotals showAll />

          <WorklogsUpdating>
            {this.props.updating ? (
              `Fetching worklogs...`
            ) : (
              <LargeIcon
                clickable
                onClick={() => { this.props.fetchWorklogs(false) }}
                onContextMenu={this.onFetchOptions}
              >
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
  deleteWorklog,
  updateWorkLogTime
}

const mapStateToProps = state => ({
  worklogs: state.worklog.list,
  updating: state.worklog.updating,
  updatingWorklog: state.worklog.updatingWorklog
})

export default connect(mapStateToProps, mapDispatchToProps)(WorklogContainer)
