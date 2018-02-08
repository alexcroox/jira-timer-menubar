import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { secondsHuman } from '../../lib/time'

class WorklogTotals extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div>
        {this.props.worklogs.length === 0 && this.props.updating && (
          `Calculating posted time...`
        )}

        {this.props.worklogs.length !== 0 && (
          <Fragment>
            <TimeSummaryContainer>
              Today <TimeSummary>{secondsHuman(this.props.totals.day)}</TimeSummary>
            </TimeSummaryContainer>

            {this.props.showAll && (
              <Fragment>
                <TimeSummaryContainer>
                  Yesterday <TimeSummary>{secondsHuman(this.props.totals.yesterday)}</TimeSummary>
                </TimeSummaryContainer>
                <TimeSummaryContainer>
                  Week <TimeSummary>{Math.floor(this.props.totals.week / 3600)}h</TimeSummary>
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
  totals: state.worklog.totals,
  updating: state.worklog.updating
})

export default connect(mapStateToProps)(WorklogTotals)
