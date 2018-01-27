import React, { Component } from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPlay from '@fortawesome/fontawesome-free-solid/faPlay'
import Button from './button'
import IconLink from './icon-link'

class Task extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <TaskWrapper hasTimer={this.props.hasTimer}>
        <Play icon={faPlay} onClick={this.props.onAddTimer} />
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

const Play = styled(FontAwesomeIcon)`
  color: #CCC;
  margin-right: 15px;

  &:hover {
    cursor: pointer;
  }
`

export const TaskContainer = styled.div`
  overflow: auto;
  height: 147px;
`

const TaskWrapper = styled.div`
  border-top: 1px solid #D8D8D8;
  background-color: #FFF;
  padding: 10px 10px 10px 14px;
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
  }

  ${props => (props.hasTimer) && css`
    background-color: rgba(35,129,250,0.1) !important;

    & > ${Play} {
      opacity: 0;
    }
  `}

  &:hover ${Play} {
    color: #6B6B6B;
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
