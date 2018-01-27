import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPlay from '@fortawesome/fontawesome-free-solid/faPlay'
import faPause from '@fortawesome/fontawesome-free-solid/faPause'
import { TaskTitle } from '../../components/task'
import Button from '../../components/button'

class TimerContainer extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    if (!this.props.timerActive)
      return (
        <div>
          <TimerWrapper>
            <Control icon={faPause} />
            <Time>00:23:57</Time>
            <TaskTitle>SI123 This is a test yo omg yes I like it fe fwefew weffewfew</TaskTitle>
            <PostButton positive>Post</PostButton>
          </TimerWrapper>
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

  &:nth-child(even) {
    border-top: 1px solid #4EADFA;
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
  }
`

const PostButton = styled(Button)`
  margin-left: 15px;
`

const mapDispatchToProps = {}

const mapStateToProps = state => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(TimerContainer)
