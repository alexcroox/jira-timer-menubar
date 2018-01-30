import { remote } from 'electron'
import React, { Component } from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { openInJira } from '../lib/jira'
import Button from './button'
import IconLink from './icon-link'
import Control from '../components/control'

class Task extends Component {
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
      <TaskWrapper
        hasTimer={this.props.hasTimer}
        onClick={this.props.onAddTimer}
        onContextMenu={() => { this.onContextMenu(this.props.taskKey) }}
      >
        <TaskTitle>{this.props.title}</TaskTitle>
        <TaskKey>{this.props.taskKey}</TaskKey>
      </TaskWrapper>
    )
  }
}

Task.propTypes = {
  title: PropTypes.string.isRequired,
  taskKey: PropTypes.string.isRequired
}

export const TaskContainer = styled.div`
  overflow: auto;

  ${props => (props.fixedHeight) && css`
    height: 147px;
  `}
`

const TaskWrapper = styled.div`
  border-top: 1px solid #D8D8D8;
  background-color: #FFF;
  padding: 10px 12px;
  display: flex;
  align-items: center;

  &:nth-child(even) {
    background-color: #F4F3F2;
  }

  &:first-child {
    border-top: none;
  }

  &:hover {
    cursor: pointer;
    background-color: rgba(35,129,250,0.1)
  }
`

const TaskKey = styled.span`
  font-weight: 500;
  color: #666;
  margin-right: 5px;
`

export const TaskTitle = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`

export default Task
