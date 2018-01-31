import { remote, ipcRenderer } from 'electron'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import find from 'lodash.find'
import { formatSecondsToStopWatch } from '../../lib/time'
import { openInJira } from '../../lib/jira'
import { deleteTimer, pauseTimer, postTimer } from '../../modules/timer'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPlay from '@fortawesome/fontawesome-free-solid/faPlay'
import faPause from '@fortawesome/fontawesome-free-solid/faPause'
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
import faEllipsisH from '@fortawesome/fontawesome-free-solid/faEllipsisH'
import { TaskTitle } from '../../components/task'
import Button from '../../components/button'
import Control from '../../components/control'
import OptionDots from '../../components/option-dots'

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
    this.displayTimers()
    this.renderTime = true
  }

  componentWillUnmount () {
    console.warn('Unmounting')
    this.renderTime = false
  }

  displayTimers () {

    if (!this.renderTime)
      return

    let firstRunningTimer = null

    let timers = this.props.timers.map(reduxTimer => {

      let timer = {...reduxTimer}

      let timeInMs = timer.previouslyElapsed

      if (!timer.paused) {
        timeInMs = (Date.now() - timer.startTime) + timer.previouslyElapsed

        if (!firstRunningTimer)
          firstRunningTimer = timer
      }

      let timeInSeconds = Math.round(timeInMs/1000)
      timer.stopWatchDisplay = formatSecondsToStopWatch(timeInSeconds)
      timer.menubarDisplay = formatSecondsToStopWatch(timeInSeconds, 'hh:mm')

      return timer
    })

    let titleUpdate = 'Idle'

    if (timers.length) {

      // Update our menu bar title with the time of the first unpaused timer
      if (firstRunningTimer)
        titleUpdate = `${firstRunningTimer.key} ${firstRunningTimer.menubarDisplay}`

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

  onOpenOptions (timer) {
    const { Menu, MenuItem } = remote

    let postTimer = this.props.postTimer
    let deleteTimer = this.props.deleteTimer

    const menu = new Menu()

    menu.append(new MenuItem({
      label: `Post ${timer.menubarDisplay} to JIRA`,
      click () { postTimer(timer) }
    }))

    menu.append(new MenuItem({
      label: 'Open in JIRA',
      click () { openInJira(timer.key) }
    }))

    menu.append(new MenuItem({
      label: 'Delete timer',
      click () { deleteTimer(timer.id) }
    }))

    menu.popup()
  }

  render () {
    if (this.props.timers.length && !this.props.hideTimers)
      return (
        <div>
          {this.state.timers.map(timer => (
            <TimerWrapper key={timer.id}>
              {timer.posting ? (
                <Control light>
                  <FontAwesomeIcon icon={faSpinner} spin />
                </Control>
              ) : (
                <Fragment>
                  {timer.paused ? (
                    <Control light onClick={() => this.props.pauseTimer(timer.id, false)}>
                      <FontAwesomeIcon icon={faPlay} />
                    </Control>
                  ) : (
                    <Control light onClick={() => this.props.pauseTimer(timer.id, true)}>
                      <FontAwesomeIcon icon={faPause} />
                    </Control>
                  )}
                </Fragment>
              )}

              <Time>{timer.stopWatchDisplay}</Time>
              <TaskTitle>{timer.key} {timer.summary}</TaskTitle>
              <OptionDots
                largeMarginLeft
                light
                onClick={() => this.onOpenOptions(timer)}
                onContextMenu={() => this.onOpenOptions(timer)}
              />
            </TimerWrapper>
          ))}
        </div>
      )
    else return (null)
  }
}

const TimerWrapper = styled.div`
  padding: 0 15px 0 4px;
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
  margin-left: 5px;
`

const mapDispatchToProps = {
  deleteTimer,
  pauseTimer,
  postTimer
}

const mapStateToProps = state => ({
  timers: state.timer.list
})

export default connect(mapStateToProps, mapDispatchToProps)(TimerContainer)
