import { remote } from 'electron'
import React, { Component } from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { openInJira } from '../lib/jira'
import { secondsHuman } from '../lib/time'
import humanTime from 'pretty-ms'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'

class Worklog extends Component {
  constructor(props) {
    super(props)

    this.onOpenOptions = this.onOpenOptions.bind(this)
  }

  onOpenOptions () {
    const { Menu, MenuItem } = remote

    const menu = new Menu()

    menu.append(new MenuItem({
      label: `Edit ${secondsHuman(this.props.timeSpentSeconds)} logged for ${this.props.task.key}`,
      click () { openInJira(this.props.task.key) }
    }))

    menu.append(new MenuItem({
      label: `Open ${this.props.task.key} in JIRA`,
      click () { openInJira(this.props.task.key) }
    }))

    menu.append(new MenuItem({
      label: `Delete ${secondsHuman(this.props.timeSpentSeconds)} from ${this.props.task.key}`,
      click () { openInJira(this.props.task.key) }
    }))

    menu.popup()
  }

  render() {
    return (
      <WorklogWrapper onContextMenu={() => this.onOpenOptions()}>
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
  border-bottom: 1px solid rgba(234,234,234,0.8);
  background-color: #FFF;
  padding: 10px 12px;
  display: flex;
  align-items: center;

  &:nth-child(even) {
    background-color: rgba(234,234,234,0.4);
  }

  &:hover {
    background-color: rgba(35,129,250,0.1);
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
