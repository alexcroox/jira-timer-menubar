import { remote } from 'electron'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { deleteTimer } from '../../modules/timer'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPlay from '@fortawesome/fontawesome-free-solid/faPlay'
import faPause from '@fortawesome/fontawesome-free-solid/faPause'
import faEllipsisH from '@fortawesome/fontawesome-free-solid/faEllipsisH'
import { TaskTitle } from '../../components/task'
import Button from '../../components/button'

class TimerContainer extends Component {
  constructor (props) {
    super(props)

    this.onOpenOptions = this.onOpenOptions.bind(this)
  }

  onOpenOptions (timerId) {
    const {Menu, MenuItem} = remote

    let deleteTimer = this.deleteTimer.bind(this)

    const menu = new Menu()

    menu.append(new MenuItem({
      label: 'Post 1h 10m to JIRA',
      click () { console.log('Post', timerId) }
    }))
    menu.append(new MenuItem({
      label: 'Delete timer',
      click () { deleteTimer(timerId) }
    }))

    menu.popup()
  }

  deleteTimer (timerId) {
    console.log('Delete', timerId)
    this.props.deleteTimer(timerId)
  }

  render () {
    if (this.props.timers.length)
      return (
        <div>
          {this.props.timers.map(timer => (
            <TimerWrapper key={timer.id}>
              <Control icon={faPause} />
              <Time>00:23:49</Time>
              <TaskTitle>{timer.key} {timer.summary}</TaskTitle>
              <TimerOptions
                icon={faEllipsisH}
                onClick={() => this.onOpenOptions(timer.id)}
                onContextMenu={() => this.onOpenOptions(timer.id)}
              />
            </TimerWrapper>
          ))}
        </div>
      )
    else return (null)
  }
}

const TimerWrapper = styled.div`
  padding: 10px 10px 10px 14px;
  background: #2381FA;
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #4EADFA;

  &:first-child {
    border-top: none;
  }
`

const Time = styled.span`
  font-weight: 500;
  letter-spacing: 0.04em;
  background-color: #0049C5;
  padding: 3px 10px 4px;
  border-radius: 5px;
  margin-right: 15px;
`

const Control = styled(FontAwesomeIcon)`
  color: #FFF;
  margin-right: 15px;

  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`

const TimerOptions = styled(FontAwesomeIcon)`
  font-size: 23px;
  margin-left: 15px;
  margin-right: 5px;

  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`

const mapDispatchToProps = {
  deleteTimer
}

const mapStateToProps = state => ({
  timers: state.timer.list
})

export default connect(mapStateToProps, mapDispatchToProps)(TimerContainer)
