import { remote } from 'electron'
import React, { Component } from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { openInJira } from '../lib/jira'
import { secondsHuman } from '../lib/time'
import humanTime from 'pretty-ms'

class Worklog extends Component {
  constructor(props) {
    super(props)

    this.onContextMenu = this.onContextMenu.bind(this)
  }

  onContextMenu (taskKey) {
    const { Menu, MenuItem } = remote

    const menu = new Menu()

    menu.append(new MenuItem({
      label: `Open ${taskKey} in JIRA`,
      click () { openInJira(taskKey) }
    }))

    menu.popup()
  }

  render() {
    return (
      <WorklogWrapper
        onContextMenu={() => { this.onContextMenu(this.props.task.key) }}
      >
        <WorklogTaskKey>{this.props.task.key}</WorklogTaskKey>
        <TaskTitle>{this.props.task.summary}</TaskTitle>
        <WorklogTime>{secondsHuman(this.props.timeSpentSeconds)}</WorklogTime>
      </WorklogWrapper>
    )
  }
}

Worklog.propTypes = {
  task: PropTypes.object.isRequired
}

const WorklogWrapper = styled.div`
  border-bottom: 1px solid #D8D8D8;
  background-color: #FFF;
  padding: 10px 12px;
  display: flex;
  align-items: center;

  &:nth-child(even) {
    background-color: #F4F3F2;
  }
`

const WorklogTaskKey = styled.span`
  font-weight: 500;
  color: #666;
  margin-right: 5px;
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
