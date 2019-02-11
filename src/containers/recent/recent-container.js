import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import sortBy from 'lodash.sortby'
import { addTimer } from '../../modules/timer'
import { Scrollbars } from 'react-custom-scrollbars'
import HeadingBar from '../../components/heading-bar'
import Task from '../../components/task'

class RecentContainer extends Component {
  constructor (props) {
    super(props)

    this.onAddTimer = this.onAddTimer.bind(this)
  }

  onAddTimer (id, key, summary) {
    this.props.addTimer(id, key, summary)
  }

  render () {
    if (this.props.recentTasks.length) {
      let orderedByOldest = sortBy(this.props.recentTasks, function(t) {
        return (typeof t.lastPosted !== "undefined")? parseInt(t.lastPosted) : 0
      })
      let orderedByMostRecent = orderedByOldest.reverse()

      return (
        <Fragment>
          <HeadingBar borderBottom borderTop>
            Recent tasks
          </HeadingBar>

          <Scrollbars
            autoHeight={true}
            autoHeightMax={331}
          >
            {orderedByMostRecent.map(task => (
              <Task
                key={task.id}
                taskKey={task.key}
                projectTransitions={task.projectTransitions}
                projectKey={'123'}
                title={task.summary}
                onAddTimer={() => this.onAddTimer(task.id, task.key, task.summary)}
              />
            ))}
          </Scrollbars>
        </Fragment>
      )
    } else {
      return (null)
    }
  }
}

const mapDispatchToProps = {
  addTimer
}

const mapStateToProps = state => ({
  recentTasks: state.recent.list
})

export default connect(mapStateToProps, mapDispatchToProps)(RecentContainer)
