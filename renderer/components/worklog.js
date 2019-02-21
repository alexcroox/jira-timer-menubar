import React, { Component } from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { Margin } from 'styled-components-spacing'
import { secondsHuman } from '../lib/time'
import humanTime from 'pretty-ms'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
import Control from './control'
import EditTime from './edit-time'

class Worklog extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <WorklogWrapper
        loading={this.props.loading}
        onContextMenu={this.props.onOpenOptions}>
        {this.props.deleting && (
          <Control marginRight noPadding>
            <FontAwesomeIcon icon={faSpinner} spin />
          </Control>
        )}

        <WorklogTaskKey>{this.props.task.key}</WorklogTaskKey>
        <TaskTitle>{this.props.task.summary}</TaskTitle>

        {this.props.updating && (
          <Margin right={2}>
            <FontAwesomeIcon icon={faSpinner} spin />
          </Margin>
        )}

        {this.props.editingWorklogTime === this.props.id ? (
          <EditTime
            worklog
            timeId={this.props.id}
            onTimeChanged={this.props.onTimeChanged}
            onResetEditTime={this.props.onResetEditTime}
            placeholder={this.props.timeEditPlaceholder}
          />
        ) : (
          <WorklogTime onClick={() => this.props.onEditTime(this.props.id)}>
            {secondsHuman(this.props.timeSpentSeconds)}
          </WorklogTime>
        )}

      </WorklogWrapper>
    )
  }
}

Worklog.propTypes = {
  task: PropTypes.object.isRequired
}

const WorklogWrapper = styled.div`
  border-top: 1px solid ${props => props.theme.darkMode ? props.theme.dark.tableRow : 'rgba(234,234,234,0.8)' };
  background-color: ${props => props.theme.darkMode ? props.theme.dark.tableRowAlt : '#FFF' };
  padding: 10px 12px;
  display: flex;
  align-items: center;
  color: ${props => props.theme.darkMode ? props.theme.dark.color : 'inherit' };

  &:nth-child(even) {
    background-color: ${props => props.theme.darkMode ? props.theme.dark.tableRow : 'rgba(234,234,234,0.4)' };
  }

  &:hover {
    background-color: ${props => props.theme.darkMode ? props.theme.dark.backgroundColor : 'rgba(35,129,250,0.1)' };
    cursor: ${props => props.loading ? 'progress' : 'default' };
  }
`

const WorklogTaskKey = styled.span`
  font-weight: 500;
  color: #666;
  margin-right: 10px;
`

const WorklogTime = styled.span`
  font-weight: 500;
  color: #666;
  margin-right: 5px;
`

const TaskTitle = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`

export default Worklog
