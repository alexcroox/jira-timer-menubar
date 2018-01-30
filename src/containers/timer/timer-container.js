import { remote, ipcRenderer } from 'electron'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import opn from 'opn'
import { formatSecondsToStopWatch } from '../../lib/time'
import { deleteTimer, pauseTimer } from '../../modules/timer'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPlay from '@fortawesome/fontawesome-free-solid/faPlay'
import faPause from '@fortawesome/fontawesome-free-solid/faPause'
import faEllipsisH from '@fortawesome/fontawesome-free-solid/faEllipsisH'
import { TaskTitle } from '../../components/task'
import Button from '../../components/button'

class TimerContainer extends Component {
  constructor (props) {
    super(props)

    this.renderTime = true
    this.lastTitleUpdate = null
    this.state = {
      timers: []
    }

    this.onOpenOptions = this.onOpenOptions.bind(this)
    this.displayTimers = this.displayTimers.bind(this)
  }

  componentDidMount () {
    if (this.props.timers.length) {
      this.displayTimers()
    }

    this.renderTime = true
  }

  //opn(`https://sidigital.atlassian.net/projects/${issue.fields.project.key}/issues/${issue.key}`)

  componentWillUnmount () {
    console.warn('Unmounting')
    this.renderTime = false
  }

  displayTimers () {

    if (!this.renderTime)
      return

    let timers = []

    this.props.timers.map(reduxTimer => {

      let timer = {...reduxTimer}

      let timeInMs = timer.previouslyElapsed

      if (!timer.paused) {
        timeInMs = (Date.now() - timer.startTime) + timer.previouslyElapsed
      }

      let timeInSeconds = Math.round(timeInMs/1000)
      timer.stopWatchDisplay = formatSecondsToStopWatch(timeInSeconds)
      timer.menubarDisplay = formatSecondsToStopWatch(timeInSeconds, 'hh:mm')

      timers.push(timer)
    })

    let titleUpdate = 'Idle'

    if (timers.length) {
      // Update our menu bar title with the time of the first timer only
      let firstTimer = timers[0]
      titleUpdate = `${firstTimer.key} ${firstTimer.menubarDisplay}`

      this.setState({
        timers
      })
    }

    // No point hammering the ipcRenderer if we don't
    // have anything different to display
    if (this.lastTitleUpdate !== titleUpdate) {
      ipcRenderer.send('updateTitle', titleUpdate)
      this.lastTitleUpdate = titleUpdate
    }

    if (this.renderTime)
      setTimeout(() => this.displayTimers(), 500)
  }

  deleteTimer (timerId) {
    console.log('Delete', timerId)
    this.props.deleteTimer(timerId)
  }

  onOpenOptions (timerId) {
    const { Menu, MenuItem } = remote

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

  render () {
    if (this.props.timers.length)
      return (
        <div>
          {this.state.timers.map(timer => (
            <TimerWrapper key={timer.id}>
              {timer.paused ? (
                <Control icon={faPlay} onClick={() => this.props.pauseTimer(timer.id, false)} />
              ) : (
                <Control icon={faPause} onClick={() => this.props.pauseTimer(timer.id, true)} />
              )}

              <Time>{timer.stopWatchDisplay}</Time>
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
  deleteTimer,
  pauseTimer
}

const mapStateToProps = state => ({
  timers: state.timer.list
})

export default connect(mapStateToProps, mapDispatchToProps)(TimerContainer)
