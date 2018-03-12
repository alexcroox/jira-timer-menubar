import { remote, ipcRenderer } from 'electron'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import find from 'lodash.find'
import parseDuration from 'parse-duration'
import { formatSecondsToStopWatch, roundToNearestMinutes, secondsHuman } from '../../lib/time'
import { openInJira } from '../../lib/jira'
import { deleteTimer, pauseTimer, postTimer, updateTimer } from '../../modules/timer'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPlay from '@fortawesome/fontawesome-free-solid/faPlay'
import faPause from '@fortawesome/fontawesome-free-solid/faPause'
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
import faEllipsisH from '@fortawesome/fontawesome-free-solid/faEllipsisH'
import { TaskTitle } from '../../components/task'
import Button from '../../components/button'
import Control from '../../components/control'
import OptionDots from '../../components/option-dots'
import EditTime from '../../components/edit-time'

class TimerContainer extends Component {
  constructor (props) {
    super(props)

    this.renderTime = true
    this.lastTitleUpdate = null
    this.state = {
      timers: [],
      editingTimer: null
    }

    this.onOpenOptions = this.onOpenOptions.bind(this)
    this.displayTimers = this.displayTimers.bind(this)
    this.onTimeChanged = this.onTimeChanged.bind(this)
    this.onEditTime = this.onEditTime.bind(this)
    this.onResetEditTime = this.onResetEditTime.bind(this)
    this.onPlay = this.onPlay.bind(this)
  }

  componentDidMount () {
    this.displayTimers()
    this.renderTime = true
  }

  componentWillUnmount () {
    console.warn('Unmounting')
    this.renderTime = false
  }

  onPlay (timerId) {
    this.onResetEditTime()
    this.props.pauseTimer(timerId, false)
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
      timer.menubarDisplay = formatSecondsToStopWatch((roundToNearestMinutes(timeInSeconds,1) - 1) * 60, 'hh:mm')
      timer.realTimeSecondsElapsed = timeInSeconds

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

  onEditTime (timerId) {
    this.props.pauseTimer(timerId, true)

    this.setState({ editingTimer: timerId })
  }

  onTimeChanged (timerId, editedTime) {
    if (editedTime != '') {
      let ms = parseDuration(editedTime)

      // Is the timer entered valid?
      if (ms > 0)
        this.props.updateTimer(timerId, ms)
    }

    this.onResetEditTime()
  }

  onResetEditTime () {
    this.setState({ editingTimer: null })
  }

  onOpenOptions (timer) {
    const { Menu, MenuItem } = remote

    let nearestMinutes = roundToNearestMinutes(timer.realTimeSecondsElapsed)
    let humanTime = secondsHuman(nearestMinutes * 60)

    const menu = new Menu()

    menu.append(new MenuItem({
      label: `Post ${humanTime} to JIRA`,
      click: () => { this.props.postTimer(timer) }
    }))

    menu.append(new MenuItem({
      label: 'Open in JIRA',
      click () { openInJira(timer.key) }
    }))

    menu.append(new MenuItem({
      label: 'Edit time',
      click: () => { this.onEditTime(timer.id) }
    }))

    menu.append(new MenuItem({
      label: 'Delete timer',
      click: () => { this.props.deleteTimer(timer.id) }
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
                    <Control light onClick={() => this.onPlay(timer.id)}>
                      <FontAwesomeIcon icon={faPlay} />
                    </Control>
                  ) : (
                    <Control light onClick={() => this.props.pauseTimer(timer.id, true)}>
                      <FontAwesomeIcon icon={faPause} />
                    </Control>
                  )}
                </Fragment>
              )}

              <Time>
                {this.state.editingTimer === timer.id ? (
                  <EditTime
                    timeId={timer.id}
                    onTimeChanged={this.onTimeChanged}
                    onResetEditTime={this.onResetEditTime}
                    placeholder={secondsHuman(Math.round(timer.previouslyElapsed / 1000))}
                  />
                ) : (
                  <span onClick={() => this.onEditTime(timer.id)}>
                    {timer.stopWatchDisplay}
                  </span>
                )}
              </Time>
              <TaskTitle>{timer.key} {timer.summary}</TaskTitle>
              <OptionDots
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
  background: #2E87FB;
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
  postTimer,
  updateTimer
}

const mapStateToProps = state => ({
  timers: state.timer.list
})

export default connect(mapStateToProps, mapDispatchToProps)(TimerContainer)
