import { remote, ipcRenderer } from 'electron'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import find from 'lodash.find'
import findIndex from 'lodash.findindex'
import filter from 'lodash.filter'
import { timerList, formatSecondsToStopWatch } from '../../lib/stopwatch'
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

    this.renderTime = true
    this.lastTitleUpdate = null
    this.state = {
      timers: []
    }

    this.onOpenOptions = this.onOpenOptions.bind(this)
    this.updateTimers = this.updateTimers.bind(this)
    this.onPauseTimer = this.onPauseTimer.bind(this)
    this.onResumeTimer = this.onResumeTimer.bind(this)
  }

  componentDidMount () {
    if (this.props.timers.length) {
      this.updateTimers()
    }

    this.renderTime = true
  }

  componentWillUnmount () {
    console.warn('Unmounting')
    this.renderTime = false
  }

  updateTimers () {

    if (!this.renderTime)
      return

    // Redux won't let us store the timer functions so
    // we need to keep a reference to them and then clone that
    // to the component state so the view can be updated.
    // This is yuck but I know of no better way, please help...
    this.props.timers.map(timer => {

      if (timer.paused)
        return

      let matchedTimer = find(timerList, ['id', timer.id])

      if (matchedTimer && !matchedTimer.paused) {
        let timeInMs = matchedTimer.stopwatch.read()
        let timeInSeconds = Math.round(timeInMs/1000)
        matchedTimer.stopWatchDisplay = formatSecondsToStopWatch(timeInSeconds)
        matchedTimer.menubarDisplay = formatSecondsToStopWatch(timeInSeconds, 'hh:mm')
        matchedTimer.paused = false
      }
    })

    let titleUpdate = 'Idle'

    if (timerList.length) {
      // Update our menu bar title with the time of the first timer only
      let firstTimer = timerList[0]
      titleUpdate = `${firstTimer.key} ${firstTimer.menubarDisplay}`

      this.setState({
        timers: timerList
      })
    }

    // No point hammering the ipcRenderer if we don't
    // have anything different to display
    if (this.lastTitleUpdate !== titleUpdate) {
      ipcRenderer.send('updateTitle', titleUpdate)
      this.lastTitleUpdate = titleUpdate
    }

    if (this.renderTime)
      setTimeout(() => this.updateTimers(), 500)
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

  onPauseTimer (timerId) {
    let matchedTimer = find(timerList, ['id', timerId])

    if (matchedTimer) {
      matchedTimer.stopwatch.split()
      matchedTimer.paused = true
    }

    let timers = [...this.state.timers]
    let matchedStateTimer = find(timers, ['id', timerId])

    if (matchedStateTimer) {
      matchedStateTimer.paused = true

      this.setState(prevState => {
        return {
          ...prevState,
          timers
        }
      })
    }
  }

  onResumeTimer (timerId) {
    let matchedTimer = find(timerList, ['id', timerId])

    if (matchedTimer) {
      matchedTimer.stopwatch.unsplit()
    }
  }

  deleteTimer (timerId) {
    console.log('Delete', timerId)
    this.props.deleteTimer(timerId)
  }

  render () {
    if (this.props.timers.length)
      return (
        <div>
          {this.state.timers.map(timer => (
            <TimerWrapper key={timer.id}>
              {timer.paused ? (
                <Control icon={faPlay} onClick={() => this.onResumeTimer(timer.id)} />
              ) : (
                <Control icon={faPause} onClick={() => this.onPauseTimer(timer.id)} />
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
  deleteTimer
}

const mapStateToProps = state => ({
  timers: state.timer.list
})

export default connect(mapStateToProps, mapDispatchToProps)(TimerContainer)
