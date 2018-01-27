import React, { Component, Fragment } from 'react'
import styled from 'styled-components'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPlay from '@fortawesome/fontawesome-free-solid/faPlay'
import HeadingBar from '../../components/heading-bar'
import Task from '../../components/task'

class SearchContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      recents: []
    }
  }

  render () {
    if (this.state.recents.length)
      return (
        <Fragment>
          <HeadingBar>
            Recent tasks
          </HeadingBar>

          {this.state.recents.map(task => (
            <Task
              key={task.id}
              taskKey={task.key}
              title={task.title}
            />
          ))}
        </Fragment>
      )
    else return (null)
  }
}

export default SearchContainer
