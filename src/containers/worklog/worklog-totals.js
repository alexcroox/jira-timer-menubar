import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import parse from 'date-fns/parse'
import isToday from 'date-fns/is_today'
import isThisWeek from 'date-fns/is_this_week'
import isYesterday from 'date-fns/is_yesterday'
import { secondsHuman } from '../../lib/time'

class WorklogTotals extends Component {
  constructor (props) {
    super(props)
  }

  render () {

    let dayTotal = 0
    let yesterdayTotal = 0
    let weekTotal = 0

    if (this.props.worklogs.length) {

      this.props.worklogs.forEach(worklog => {
        let created = parse(worklog.created)

        if (isToday(created))
          dayTotal += worklog.timeSpentSeconds

        if (isYesterday(created))
          yesterdayTotal += worklog.timeSpentSeconds

        // Week starts on Monday (1)
        if (isThisWeek(created, 1))
          weekTotal += worklog.timeSpentSeconds
      })
    }

    return (
      <div>
        {this.props.worklogs.length === 0 && this.props.updating && (
          `Calculating posted time...`
        )}

        {this.props.worklogs.length !== 0 && (
          <Fragment>
            <TimeSummaryContainer>
              Today <TimeSummary>{secondsHuman(dayTotal)}</TimeSummary>
            </TimeSummaryContainer>

            {this.props.showAll && (
              <Fragment>
                <TimeSummaryContainer>
                  Yesterday <TimeSummary>{secondsHuman(yesterdayTotal)}</TimeSummary>
                </TimeSummaryContainer>
                <TimeSummaryContainer>
                  Week <TimeSummary>{secondsHuman(weekTotal)}</TimeSummary>
                </TimeSummaryContainer>
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
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
  worklogs: state.worklog.list,
  updating: state.worklog.updating
})

export default connect(mapStateToProps)(WorklogTotals)
