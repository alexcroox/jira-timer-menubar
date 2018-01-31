import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { addTimer } from '../../modules/timer'
import styled from 'styled-components'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPlay from '@fortawesome/fontawesome-free-solid/faPlay'
import HeadingBar from '../../components/heading-bar'
import Task, { TaskContainer } from '../../components/task'

class RecentContainer extends Component {
  constructor (props) {
    super(props)

    this.onAddTimer = this.onAddTimer.bind(this)
  }

  onAddTimer (id, key, summary) {
    this.props.addTimer(id, key, summary)
  }

  render () {
    if (this.props.recentTasks.length)
      return (
        <Fragment>
          <HeadingBar borderBottom borderTop>
            Recent tasks
          </HeadingBar>

          {this.props.recentTasks.length !== 0 && (
            <TaskContainer>
              {this.props.recentTasks.map(task => (
                <Task
                  key={task.id}
                  taskKey={task.key}
                  title={task.summary}
                  onAddTimer={() => this.onAddTimer(task.id, task.key, task.summary)}
                />
              ))}
            </TaskContainer>
          )}
        </Fragment>
      )
    else return (null)
  }
}

const mapDispatchToProps = {
  addTimer
}

const mapStateToProps = state => ({
  recentTasks: state.recent.list
})

export default connect(mapStateToProps, mapDispatchToProps)(RecentContainer)
