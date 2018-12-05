import React, { Component } from 'react'
import styled, { css } from 'styled-components'
import { TextArea } from './input'
import { TaskTitle, TaskSummary } from './task'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faTimes from '@fortawesome/fontawesome-free-solid/faTimes'

class EditComment extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editedComment: ''
    }

    this.onResetEditComment = this.onResetEditComment.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  onKeyPress (e) {
    if (e.key === 'Enter' && !e.shiftKey)
      this.props.onCommentSaved(this.props.timer, this.state.editedComment)

    if (e.key === 'Escape')
      this.onResetEditComment()
  }

  onChange (event) {
    this.setState({ editedComment: event.target.value })
  }

  onResetEditComment () {
    this.setState({ editedComment: '' })
    this.props.onResetEditComment(this.props.timer.id)
  }

  render() {
    return (
      <EditCommentContainer>
        <EditCommentSummary>
          <TaskTitle light>
            <span>{`${this.props.postingHumanTime} ${this.props.timer.key} `}</span>
            <TaskSummary>{this.props.timer.summary}</TaskSummary>
          </TaskTitle>

          <EditCommentCancel onClick={() => this.onResetEditComment()}>
            <FontAwesomeIcon
              icon={faTimes}
            />
            Cancel
          </EditCommentCancel>
        </EditCommentSummary>

        <TextArea
          {...this.props}
          autoFocus
          value={this.state.editedComment}
          onChange={this.onChange}
          onKeyUp={this.onKeyPress}
          //onBlur={this.onResetEditComment}
        />
      </EditCommentContainer>
    )
  }
}

const EditCommentContainer = styled.div`
  background: #0749C2;
  padding: 0 15px 10px;
`

const EditCommentSummary = styled.div`
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const EditCommentCancel = styled.div`
  color: #FFF;

  &:hover {
    cursor: pointer;
  }

  & > svg {
    margin-right: 5px;
  }
`

export default EditComment
